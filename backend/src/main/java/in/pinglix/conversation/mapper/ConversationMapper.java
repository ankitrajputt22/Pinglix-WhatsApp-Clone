package in.pinglix.conversation.mapper;

import in.pinglix.conversation.Conversation;
import in.pinglix.conversation.dto.ConversationParticipantResponse;
import in.pinglix.conversation.dto.ConversationResponse;
import in.pinglix.user.User;

public final class ConversationMapper {

    private ConversationMapper() {
    }

    public static ConversationResponse toResponse(
            Conversation conversation,
            User otherParticipant
    ) {
        return new ConversationResponse(
                conversation.getId(),
                conversation.getConversationType(),
                conversation.getTitle(),
                conversation.getImageUrl(),
                new ConversationParticipantResponse(
                        otherParticipant.getId(),
                        otherParticipant.getDisplayName(),
                        otherParticipant.getEmail(),
                        otherParticipant.getProfileImageUrl(),
                        otherParticipant.getAbout(),
                        otherParticipant.getLastSeenAt()
                ),
                conversation.getLastMessageAt(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }
}
