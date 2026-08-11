package in.pinglix.user;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("""
            select user
            from User user
            where user.id = :userId
              and user.accountStatus = in.pinglix.user.AccountStatus.ACTIVE
              and user.deletedAt is null
              and (user.lockedUntil is null or user.lockedUntil <= current_timestamp)
            """)
    Optional<User> findAvailableById(@Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select user
            from User user
            where user.id = :userId
              and user.accountStatus = in.pinglix.user.AccountStatus.ACTIVE
              and user.deletedAt is null
              and (user.lockedUntil is null or user.lockedUntil <= current_timestamp)
            """)
    Optional<User> findAvailableByIdForUpdate(@Param("userId") Long userId);

    @Query("""
            select user
            from User user
            where user.id <> :currentUserId
              and user.accountStatus = in.pinglix.user.AccountStatus.ACTIVE
              and user.deletedAt is null
              and (user.lockedUntil is null or user.lockedUntil <= current_timestamp)
              and (
                lower(user.displayName) like lower(concat('%', :query, '%')) escape '!'
                or lower(user.email) like lower(concat('%', :query, '%')) escape '!'
              )
            order by lower(user.displayName), user.id
            """)
    List<User> searchAvailableUsers(
            @Param("currentUserId") Long currentUserId,
            @Param("query") String query,
            Pageable pageable
    );
}
