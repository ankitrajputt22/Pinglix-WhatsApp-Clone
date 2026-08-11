package in.pinglix.message;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import in.pinglix.auth.exception.AuthenticationRequiredException;
import in.pinglix.conversation.ConversationMemberRepository;
import in.pinglix.conversation.ConversationRepository;
import in.pinglix.conversation.exception.ConversationAccessDeniedException;
import in.pinglix.conversation.exception.ConversationNotFoundException;
import in.pinglix.message.dto.MessageStatusUpdateRequest;
import in.pinglix.message.dto.MessageStatusUpdateResponse;
import in.pinglix.message.exception.InvalidMessageRequestException;
import in.pinglix.realtime.RealtimeMessagePublisher;
import in.pinglix.security.CustomUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageStatusService {

    private final MessageRepository messageRepository;
    private final MessageReceiptRepository receiptRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final RealtimeMessagePublisher realtimeMessagePublisher;

    public MessageStatusService(
            MessageRepository messageRepository,
            MessageReceiptRepository receiptRepository,
            ConversationRepository conversationRepository,
            ConversationMemberRepository conversationMemberRepository,
            RealtimeMessagePublisher realtimeMessagePublisher
    ) {
        this.messageRepository = messageRepository;
        this.receiptRepository = receiptRepository;
        this.conversationRepository = conversationRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.realtimeMessagePublisher = realtimeMessagePublisher;
    }

    @Transactional
    public MessageStatusUpdateResponse markDelivered(
            CustomUserDetails principal,
            Long conversationId,
            MessageStatusUpdateRequest request
    ) {
        return update(principal, conversationId, request, false);
    }

    @Transactional
    public MessageStatusUpdateResponse markRead(
            CustomUserDetails principal,
            Long conversationId,
            MessageStatusUpdateRequest request
    ) {
        return update(principal, conversationId, request, true);
    }

    private MessageStatusUpdateResponse update(
            CustomUserDetails principal,
            Long conversationId,
            MessageStatusUpdateRequest request,
            boolean read
    ) {
        Long userId = requireUserId(principal);
        requireConversation(conversationId);
        requireMembership(conversationId, userId);
        List<Long> messageIds = normalizeMessageIds(request);

        List<Message> messages = messageRepository.findAllById(messageIds);
        if (messages.size() != new LinkedHashSet<>(messageIds).size()
                || messages.stream().anyMatch(message ->
                !conversationId.equals(message.getConversation().getId()))) {
            throw new InvalidMessageRequestException(
                    "Message IDs must belong to this conversation"
            );
        }

        Map<Long, MessageReceipt> receipts = receiptRepository
                .findByMessageIdInAndUserId(messageIds, userId)
                .stream()
                .collect(Collectors.toMap(
                        receipt -> receipt.getMessage().getId(),
                        Function.identity()
                ));

        Instant updatedAt = Instant.now();
        List<Long> updatedIds = new ArrayList<>();
        for (Message message : messages) {
            MessageReceipt receipt = receipts.get(message.getId());
            // Sender-only messages have no recipient receipt and are safely ignored.
            if (receipt == null) {
                continue;
            }
            boolean changed = read
                    ? receipt.getReadAt() == null
                    : receipt.getDeliveredAt() == null;
            if (read) {
                receipt.markRead(updatedAt);
            } else {
                receipt.markDelivered(updatedAt);
            }
            if (changed) {
                updatedIds.add(message.getId());
            }
        }

        if (!updatedIds.isEmpty()) {
            receiptRepository.flush();
            if (read) {
                realtimeMessagePublisher.publishMessageRead(
                        conversationId,
                        updatedIds,
                        userId,
                        updatedAt
                );
            } else {
                realtimeMessagePublisher.publishMessageDelivered(
                        conversationId,
                        updatedIds,
                        userId,
                        updatedAt
                );
            }
        }

        return new MessageStatusUpdateResponse(
                conversationId,
                read ? MessageStatus.READ : MessageStatus.DELIVERED,
                updatedIds,
                updatedIds.size(),
                updatedAt
        );
    }

    private List<Long> normalizeMessageIds(MessageStatusUpdateRequest request) {
        if (request == null || request.messageIds() == null
                || request.messageIds().isEmpty()) {
            throw new InvalidMessageRequestException("Message IDs are required");
        }
        List<Long> ids = request.messageIds();
        if (ids.stream().anyMatch(id -> id == null || id <= 0)) {
            throw new InvalidMessageRequestException("Message IDs are required");
        }
        return new ArrayList<>(new LinkedHashSet<>(ids));
    }

    private void requireConversation(Long conversationId) {
        if (conversationId == null || conversationId <= 0) {
            throw new InvalidMessageRequestException("Conversation ID must be valid");
        }
        if (!conversationRepository.existsById(conversationId)) {
            throw new ConversationNotFoundException();
        }
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

    private Long requireUserId(CustomUserDetails principal) {
        if (principal == null) {
            throw new AuthenticationRequiredException();
        }
        return principal.id();
    }
}
