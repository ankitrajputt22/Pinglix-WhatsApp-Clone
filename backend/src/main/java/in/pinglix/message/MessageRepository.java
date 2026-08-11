package in.pinglix.message;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @EntityGraph(attributePaths = {"conversation", "sender"})
    Optional<Message> findBySenderIdAndClientMessageId(
            Long senderId,
            String clientMessageId
    );

    @EntityGraph(attributePaths = {"conversation", "sender"})
    List<Message> findByConversationIdOrderByIdDesc(
            Long conversationId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"conversation", "sender"})
    List<Message> findByConversationIdAndIdLessThanOrderByIdDesc(
            Long conversationId,
            Long beforeMessageId,
            Pageable pageable
    );
}
