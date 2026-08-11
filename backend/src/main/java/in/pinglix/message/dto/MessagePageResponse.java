package in.pinglix.message.dto;

import java.util.List;

public record MessagePageResponse(
        List<MessageResponse> items,
        Long nextBeforeMessageId,
        boolean hasMore
) {
}
