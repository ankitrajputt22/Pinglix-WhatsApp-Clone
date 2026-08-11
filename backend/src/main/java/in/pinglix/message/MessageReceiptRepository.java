package in.pinglix.message;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageReceiptRepository extends JpaRepository<MessageReceipt, Long> {

    @EntityGraph(attributePaths = {"message", "user"})
    List<MessageReceipt> findByMessageIdInAndUserId(
            Collection<Long> messageIds,
            Long userId
    );

    @EntityGraph(attributePaths = {"message", "user"})
    List<MessageReceipt> findByMessageIdIn(Collection<Long> messageIds);

    Optional<MessageReceipt> findByMessageIdAndUserId(Long messageId, Long userId);
}
