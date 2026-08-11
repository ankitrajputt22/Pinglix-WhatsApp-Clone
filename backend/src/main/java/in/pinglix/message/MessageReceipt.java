package in.pinglix.message;

import java.time.Instant;

import in.pinglix.conversation.Conversation;
import in.pinglix.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(
        name = "message_receipts",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_message_receipts_message_user",
                columnNames = {"message_id", "user_id"}
        )
)
public class MessageReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MessageReceipt() {
    }

    public MessageReceipt(Message message, Conversation conversation, User user) {
        this.message = message;
        this.conversation = conversation;
        this.user = user;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
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

    public Message getMessage() {
        return message;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public User getUser() {
        return user;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void markDelivered(Instant at) {
        if (deliveredAt == null) {
            deliveredAt = at;
        }
    }

    public void markRead(Instant at) {
        if (deliveredAt == null) {
            deliveredAt = at;
        }
        if (readAt == null) {
            readAt = at;
        }
    }
}
