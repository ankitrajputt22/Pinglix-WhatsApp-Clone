package in.pinglix.security;

import in.pinglix.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return userRepository.findByEmailIgnoreCase(username)
                .map(CustomUserDetails::from)
                .orElseThrow(() -> new UsernameNotFoundException("User was not found"));
    }

    public CustomUserDetails loadUserById(Long id) {
        return userRepository.findById(id)
                .map(CustomUserDetails::from)
                .orElseThrow(() -> new UsernameNotFoundException("User was not found"));
    }
}
