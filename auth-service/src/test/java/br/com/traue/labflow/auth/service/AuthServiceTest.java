package br.com.traue.labflow.auth.service;

import br.com.traue.labflow.auth.dto.RegisterRequest;
import br.com.traue.labflow.auth.dto.RegisterResponse;
import br.com.traue.labflow.auth.entity.User;
import br.com.traue.labflow.auth.repository.UserRepository;
import br.com.traue.labflow.auth.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    @SuppressWarnings("null")
    void register_shouldCreateUser() {
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser")
                .email("new@labflow.com")
                .password("pass1234")
                .build();

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@labflow.com")).thenReturn(false);
        when(passwordEncoder.encode("pass1234")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        RegisterResponse response = authService.register(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("newuser");
        assertThat(response.getEmail()).isEqualTo("new@labflow.com");
    }

    @Test
    void register_duplicateUsername_shouldThrow() {
        RegisterRequest request = RegisterRequest.builder()
                .username("existing")
                .email("e@labflow.com")
                .password("pass1234")
                .build();

        when(userRepository.existsByUsername("existing")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already exists");
    }
}
