package in.pinglix.conversation;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrivateConversationRepository
        extends JpaRepository<PrivateConversation, Long> {

    @EntityGraph(attributePaths = {"conversation", "userOne", "userTwo"})
    Optional<PrivateConversation> findByUserOneIdAndUserTwoId(
            Long userOneId,
            Long userTwoId
    );

    @EntityGraph(attributePaths = {"conversation", "userOne", "userTwo"})
    Optional<PrivateConversation> findByConversationId(Long conversationId);
}
