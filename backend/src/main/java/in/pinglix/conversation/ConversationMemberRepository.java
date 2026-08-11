package in.pinglix.conversation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationMemberRepository
        extends JpaRepository<ConversationMember, Long> {

    @Query("""
            select member.conversation
            from ConversationMember member
            where member.user.id = :userId
              and member.leftAt is null
            order by coalesce(
                member.conversation.lastMessageAt,
                member.conversation.updatedAt
            ) desc
            """)
    List<Conversation> findActiveConversationsByUserId(
            @Param("userId") Long userId
    );

    boolean existsByConversationIdAndUserIdAndLeftAtIsNull(
            Long conversationId,
            Long userId
    );

    List<ConversationMember> findByConversationIdAndLeftAtIsNull(
            Long conversationId
    );

    long countByConversationIdAndLeftAtIsNull(Long conversationId);
}
