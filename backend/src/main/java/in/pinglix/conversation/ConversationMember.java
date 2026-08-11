package in.pinglix.conversation;

import java.time.Instant;

import in.pinglix.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "conversation_members",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_conversation_members_conversation_user",
                columnNames = {"conversation_id", "user_id"}
        )
)
public class ConversationMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "member_role", nullable = false, length = 30)
    private MemberRole memberRole;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @Column(name = "left_at")
    private Instant leftAt;

    @Column(name = "last_read_message_id")
    private Long lastReadMessageId;

    @Column(name = "muted_until")
    private Instant mutedUntil;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(name = "pinned_at")
    private Instant pinnedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ConversationMember() {
    }

    public ConversationMember(
            Conversation conversation,
            User user,
            MemberRole memberRole
    ) {
        this.conversation = conversation;
        this.user = user;
        this.memberRole = memberRole;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        joinedAt = now;
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public User getUser() {
        return user;
    }

    public MemberRole getMemberRole() {
        return memberRole;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public Instant getLeftAt() {
        return leftAt;
    }

    public Long getLastReadMessageId() {
        return lastReadMessageId;
    }

    public Instant getMutedUntil() {
        return mutedUntil;
    }

    public Instant getArchivedAt() {
        return archivedAt;
    }

    public Instant getPinnedAt() {
        return pinnedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
