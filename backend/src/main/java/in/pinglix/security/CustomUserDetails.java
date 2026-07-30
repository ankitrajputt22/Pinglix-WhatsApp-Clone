package in.pinglix.security;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import in.pinglix.user.AccountStatus;
import in.pinglix.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record CustomUserDetails(
        Long id,
        String email,
        String passwordHash,
        AccountStatus accountStatus,
        Instant lockedUntil,
        Instant deletedAt
) implements UserDetails {

    public static CustomUserDetails from(User user) {
        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getAccountStatus(),
                user.getLockedUntil(),
                user.getDeletedAt()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountStatus != AccountStatus.DELETED && deletedAt == null;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountStatus != AccountStatus.LOCKED
                && (lockedUntil == null || !lockedUntil.isAfter(Instant.now()));
    }

    @Override
    public boolean isEnabled() {
        return accountStatus == AccountStatus.ACTIVE && deletedAt == null;
    }
}
