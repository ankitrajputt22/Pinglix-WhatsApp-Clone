package in.pinglix.message.mapper;

import in.pinglix.message.Message;
import in.pinglix.message.MessageStatus;
import in.pinglix.message.dto.MessageResponse;
import in.pinglix.message.dto.MessageSenderResponse;
import in.pinglix.user.User;

public final class MessageMapper {

    private MessageMapper() {
    }

    public static MessageResponse toResponse(Message message) {
        return toResponse(message, message.getStatus());
    }

    public static MessageResponse toResponse(
            Message message,
            MessageStatus status
    ) {
        User sender = message.getSender();
        return new MessageResponse(
                message.getId(),
                message.getClientMessageId(),
                message.getConversation().getId(),
                new MessageSenderResponse(
                        sender.getId(),
                        sender.getDisplayName(),
                        sender.getEmail(),
                        sender.getProfileImageUrl()
                ),
                message.getMessageType(),
                message.getContent(),
                status,
                message.getCreatedAt(),
                message.getEditedAt(),
                message.getDeletedAt()
        );
    }
}
