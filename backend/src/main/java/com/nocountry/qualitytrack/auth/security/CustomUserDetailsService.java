package com.nocountry.qualitytrack.auth.security;

import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserSystemRoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedEmail = username.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials."));

        List<SimpleGrantedAuthority> authorities = user.getAccountType() == AccountType.INTERNAL
                ? roleRepository.findAllByIdUserId(user.getId()).stream()
                        .map(UserSystemRole::getRole)
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                        .toList()
                : List.of();

        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getAccountType(),
                user.getStatus(),
                authorities
        );
    }
}
