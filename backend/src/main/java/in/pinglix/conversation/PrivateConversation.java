package in.pinglix.conversation;

import java.time.Instant;

import in.pinglix.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "private_conversations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_private_conversations_user_pair",
                        columnNames = {"user_one_id", "user_two_id"}
                ),
                @UniqueConstraint(
                        name = "uk_private_conversations_conversation_id",
                        columnNames = "conversation_id"
                )
        }
)
public class PrivateConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_one_id", nullable = false)
    private User userOne;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_two_id", nullable = false)
    private User userTwo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PrivateConversation() {
    }

    public PrivateConversation(
            Conversation conversation,
            User userOne,
            User userTwo
    ) {
        if (userOne.getId() >= userTwo.getId()) {
            throw new IllegalArgumentException("Private conversation users must be ordered");
        }

        this.conversation = conversation;
        this.userOne = userOne;
        this.userTwo = userTwo;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public User getUserOne() {
        return userOne;
    }

    public User getUserTwo() {
        return userTwo;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Long otherUserId(Long currentUserId) {
        if (userOne.getId().equals(currentUserId)) {
            return userTwo.getId();
        }

        if (userTwo.getId().equals(currentUserId)) {
            return userOne.getId();
        }

        throw new IllegalArgumentException("User is not part of this private conversation");
    }
}
