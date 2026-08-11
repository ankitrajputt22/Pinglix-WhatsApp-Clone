package in.pinglix.message;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import in.pinglix.auth.exception.AuthenticationRequiredException;
import in.pinglix.conversation.Conversation;
import in.pinglix.conversation.ConversationMemberRepository;
import in.pinglix.conversation.ConversationRepository;
import in.pinglix.conversation.exception.ConversationAccessDeniedException;
import in.pinglix.conversation.exception.ConversationNotFoundException;
import in.pinglix.message.dto.MessagePageResponse;
import in.pinglix.message.dto.MessageResponse;
import in.pinglix.message.dto.SendMessageRequest;
import in.pinglix.message.exception.InvalidMessageRequestException;
import in.pinglix.message.exception.MessageSendFailedException;
import in.pinglix.message.mapper.MessageMapper;
import in.pinglix.realtime.RealtimeMessagePublisher;
import in.pinglix.security.CustomUserDetails;
import in.pinglix.user.User;
import in.pinglix.user.UserRepository;
import in.pinglix.user.exception.UserNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

    private static final int DEFAULT_PAGE_SIZE = 30;
    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_CONTENT_LENGTH = 4000;

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final MessageReceiptRepository messageReceiptRepository;
    private final UserRepository userRepository;
    private final RealtimeMessagePublisher realtimeMessagePublisher;

    public MessageService(
            MessageRepository messageRepository,
            ConversationRepository conversationRepository,
            ConversationMemberRepository conversationMemberRepository,
            MessageReceiptRepository messageReceiptRepository,
            UserRepository userRepository,
            RealtimeMessagePublisher realtimeMessagePublisher
    ) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.messageReceiptRepository = messageReceiptRepository;
        this.userRepository = userRepository;
        this.realtimeMessagePublisher = realtimeMessagePublisher;
    }

    @Transactional
    public MessageResponse sendMessage(
            CustomUserDetails principal,
            Long conversationId,
            SendMessageRequest request
    ) {
        Long currentUserId = requireUserId(principal);
        requireValidConversationId(conversationId);
        String content = validateAndTrimContent(request.content());

        // Locking the sender makes retries with the same client ID deterministic,
        // including simultaneous requests from the same account.
        User sender = userRepository.findAvailableByIdForUpdate(currentUserId)
                .orElseThrow(UserNotFoundException::new);
        Conversation conversation = requireConversation(conversationId);
        requireMembership(conversationId, currentUserId);

        return messageRepository
                .findBySenderIdAndClientMessageId(
                        currentUserId,
                        request.clientMessageId()
                )
                .map(existing -> existingMessageResponse(
                        existing,
                        conversationId,
                        currentUserId
                ))
                .orElseGet(() -> createMessage(
                        conversation,
                        sender,
                        request.clientMessageId(),
                        content
                ));
    }

    @Transactional(readOnly = true)
    public MessagePageResponse getMessages(
            CustomUserDetails principal,
            Long conversationId,
            Long beforeMessageId,
            Integer limit
    ) {
        Long currentUserId = requireUserId(principal);
        requireValidConversationId(conversationId);
        requireConversation(conversationId);
        requireMembership(conversationId, currentUserId);

        int pageSize = normalizePageSize(limit);
        PageRequest pageRequest = PageRequest.of(0, pageSize + 1);
        List<Message> fetched = beforeMessageId == null
                ? messageRepository.findByConversationIdOrderByIdDesc(
                        conversationId,
                        pageRequest
                )
                : messageRepository
                        .findByConversationIdAndIdLessThanOrderByIdDesc(
                                conversationId,
                                beforeMessageId,
                                pageRequest
                        );

        boolean hasMore = fetched.size() > pageSize;
        List<Message> page = new ArrayList<>(
                fetched.subList(0, Math.min(fetched.size(), pageSize))
        );
        Collections.reverse(page);

        Long nextBeforeMessageId = hasMore && !page.isEmpty()
                ? page.getFirst().getId()
                : null;
        Map<Long, MessageStatus> statuses = resolveStatuses(page, currentUserId);
        return new MessagePageResponse(
                page.stream().map(message -> MessageMapper.toResponse(
                        message,
                        statuses.getOrDefault(message.getId(), message.getStatus())
                )).toList(),
                nextBeforeMessageId,
                hasMore
        );
    }

    private MessageResponse createMessage(
            Conversation conversation,
            User sender,
            String clientMessageId,
            String content
    ) {
        Message message = messageRepository.saveAndFlush(
                new Message(conversation, sender, clientMessageId, content)
        );
        conversation.recordLastMessage(message.getId(), message.getCreatedAt());
        conversationRepository.save(conversation);
        conversationMemberRepository.findByConversationIdAndLeftAtIsNull(
                        conversation.getId()
                ).stream()
                .filter(member -> !member.getUser().getId().equals(sender.getId()))
                .forEach(member -> messageReceiptRepository.save(
                        new MessageReceipt(message, conversation, member.getUser())
                ));
        MessageResponse response = MessageMapper.toResponse(message, MessageStatus.SENT);
        realtimeMessagePublisher.publishMessageCreated(response);
        return response;
    }

    private MessageResponse existingMessageResponse(
            Message existing,
            Long requestedConversationId,
            Long currentUserId
    ) {
        if (!existing.getConversation().getId().equals(requestedConversationId)) {
            throw new MessageSendFailedException(
                    "Client message ID was already used"
            );
        }

        return MessageMapper.toResponse(existing, resolveStatus(existing, currentUserId));
    }

    private Map<Long, MessageStatus> resolveStatuses(
            List<Message> messages,
            Long currentUserId
    ) {
        List<Long> ownMessageIds = messages.stream()
                .filter(message -> message.getSender().getId().equals(currentUserId))
                .map(Message::getId)
                .toList();
        if (ownMessageIds.isEmpty()) {
            return Map.of();
        }
        return messageReceiptRepository.findByMessageIdIn(ownMessageIds).stream()
                .collect(Collectors.groupingBy(
                        receipt -> receipt.getMessage().getId(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                receipts -> receipts.stream().anyMatch(receipt ->
                                                receipt.getReadAt() != null)
                                        ? MessageStatus.READ
                                        : receipts.stream().anyMatch(receipt ->
                                                receipt.getDeliveredAt() != null)
                                                ? MessageStatus.DELIVERED
                                                : MessageStatus.SENT
                        )
                ));
    }

    private MessageStatus resolveStatus(Message message, Long currentUserId) {
        if (!message.getSender().getId().equals(currentUserId)) {
            return MessageStatus.SENT;
        }
        return resolveStatuses(List.of(message), currentUserId)
                .getOrDefault(message.getId(), MessageStatus.SENT);
    }

    private Conversation requireConversation(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(ConversationNotFoundException::new);
    }

    private void requireMembership(Long conversationId, Long userId) {
        if (!conversationMemberRepository
                .existsByConversationIdAndUserIdAndLeftAtIsNull(
                        conversationId,
                        userId
                )) {
            throw new ConversationAccessDeniedException();
        }
    }

    private String validateAndTrimContent(String content) {
        if (content == null) {
            throw new InvalidMessageRequestException("Message cannot be empty");
        }

        String trimmed = content.strip();
        if (trimmed.isEmpty()) {
            throw new InvalidMessageRequestException("Message cannot be empty");
        }
        if (trimmed.length() > MAX_CONTENT_LENGTH) {
            throw new InvalidMessageRequestException(
                    "Message must be at most 4000 characters"
            );
        }
        return trimmed;
    }

    private int normalizePageSize(Integer limit) {
        if (limit == null) {
            return DEFAULT_PAGE_SIZE;
        }
        if (limit < 1 || limit > MAX_PAGE_SIZE) {
            throw new InvalidMessageRequestException(
                    "Limit must be between 1 and 50"
            );
        }
        return limit;
    }

    private void requireValidConversationId(Long conversationId) {
        if (conversationId == null || conversationId <= 0) {
            throw new InvalidMessageRequestException(
                    "Conversation ID must be valid"
            );
        }
    }

    private Long requireUserId(CustomUserDetails principal) {
        if (principal == null) {
            throw new AuthenticationRequiredException();
        }
        return principal.id();
    }
}
