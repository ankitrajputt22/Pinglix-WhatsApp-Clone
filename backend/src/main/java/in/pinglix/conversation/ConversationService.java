package in.pinglix.conversation;

import java.util.List;

import in.pinglix.auth.exception.AuthenticationRequiredException;
import in.pinglix.conversation.dto.ConversationResponse;
import in.pinglix.conversation.dto.CreatePrivateConversationRequest;
import in.pinglix.conversation.exception.ConversationAccessDeniedException;
import in.pinglix.conversation.exception.ConversationNotFoundException;
import in.pinglix.conversation.exception.InvalidConversationRequestException;
import in.pinglix.conversation.mapper.ConversationMapper;
import in.pinglix.security.CustomUserDetails;
import in.pinglix.user.User;
import in.pinglix.user.UserRepository;
import in.pinglix.user.exception.UserNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final PrivateConversationRepository privateConversationRepository;
    private final UserRepository userRepository;

    public ConversationService(
            ConversationRepository conversationRepository,
            ConversationMemberRepository conversationMemberRepository,
            PrivateConversationRepository privateConversationRepository,
            UserRepository userRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.privateConversationRepository = privateConversationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ConversationResponse createPrivateConversation(
            CustomUserDetails principal,
            CreatePrivateConversationRequest request
    ) {
        Long currentUserId = requireUserId(principal);
        Long targetUserId = request.targetUserId();

        if (currentUserId.equals(targetUserId)) {
            throw new InvalidConversationRequestException(
                    "You cannot start a conversation with yourself"
            );
        }

        Long userOneId = Math.min(currentUserId, targetUserId);
        Long userTwoId = Math.max(currentUserId, targetUserId);

        // Lock in stable ID order so opposite-direction requests cannot create
        // duplicate pairs or deadlock while the unique constraint is checked.
        User userOne = findAvailableUserForUpdate(userOneId);
        User userTwo = findAvailableUserForUpdate(userTwoId);

        return privateConversationRepository
                .findByUserOneIdAndUserTwoId(userOneId, userTwoId)
                .map(privateConversation ->
                        toResponse(privateConversation, currentUserId))
                .orElseGet(() -> createConversation(
                        currentUserId,
                        userOne,
                        userTwo
                ));
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(
            CustomUserDetails principal
    ) {
        Long currentUserId = requireUserId(principal);

        return conversationMemberRepository
                .findActiveConversationsByUserId(currentUserId)
                .stream()
                .map(conversation -> privateConversationRepository
                        .findByConversationId(conversation.getId())
                        .map(privateConversation ->
                                toResponse(privateConversation, currentUserId))
                        .orElseThrow(ConversationNotFoundException::new))
                .toList();
    }

    @Transactional(readOnly = true)
    public ConversationResponse getConversation(
            CustomUserDetails principal,
            Long conversationId
    ) {
        Long currentUserId = requireUserId(principal);

        if (conversationId == null || conversationId <= 0) {
            throw new InvalidConversationRequestException(
                    "Conversation ID must be valid"
            );
        }

        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(ConversationNotFoundException::new);

        if (!conversationMemberRepository
                .existsByConversationIdAndUserIdAndLeftAtIsNull(
                        conversation.getId(),
                        currentUserId
                )) {
            throw new ConversationAccessDeniedException();
        }

        PrivateConversation privateConversation = privateConversationRepository
                .findByConversationId(conversation.getId())
                .orElseThrow(ConversationNotFoundException::new);
        return toResponse(privateConversation, currentUserId);
    }

    private ConversationResponse createConversation(
            Long currentUserId,
            User userOne,
            User userTwo
    ) {
        User creator = userOne.getId().equals(currentUserId)
                ? userOne
                : userTwo;
        Conversation conversation = conversationRepository.save(
                new Conversation(ConversationType.PRIVATE, creator)
        );

        conversationMemberRepository.saveAll(List.of(
                new ConversationMember(conversation, userOne, MemberRole.MEMBER),
                new ConversationMember(conversation, userTwo, MemberRole.MEMBER)
        ));

        PrivateConversation privateConversation =
                privateConversationRepository.save(
                        new PrivateConversation(conversation, userOne, userTwo)
                );
        return toResponse(privateConversation, currentUserId);
    }

    private ConversationResponse toResponse(
            PrivateConversation privateConversation,
            Long currentUserId
    ) {
        Long otherUserId;

        try {
            otherUserId = privateConversation.otherUserId(currentUserId);
        } catch (IllegalArgumentException exception) {
            throw new ConversationAccessDeniedException();
        }

        User otherParticipant = userRepository.findAvailableById(otherUserId)
                .orElseThrow(UserNotFoundException::new);
        return ConversationMapper.toResponse(
                privateConversation.getConversation(),
                otherParticipant
        );
    }

    private User findAvailableUserForUpdate(Long userId) {
        return userRepository.findAvailableByIdForUpdate(userId)
                .orElseThrow(UserNotFoundException::new);
    }

    private Long requireUserId(CustomUserDetails principal) {
        if (principal == null) {
            throw new AuthenticationRequiredException();
        }

        return principal.id();
    }
}
