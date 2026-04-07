package br.com.traue.labflow.auth.service;

import br.com.traue.labflow.auth.dto.*;
import br.com.traue.labflow.auth.entity.User;
import br.com.traue.labflow.auth.repository.UserRepository;
import br.com.traue.labflow.auth.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — testes unitários")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    // ── register ────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("register: usuário novo deve ser salvo e retornar RegisterResponse")
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
    @DisplayName("register: username duplicado deve lançar IllegalArgumentException")
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

    @Test
    @DisplayName("register: e-mail duplicado deve lançar IllegalArgumentException")
    void register_duplicateEmail_shouldThrow() {
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser2")
                .email("dup@labflow.com")
                .password("pass1234")
                .build();

        when(userRepository.existsByUsername("newuser2")).thenReturn(false);
        when(userRepository.existsByEmail("dup@labflow.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("register: role não informada deve usar ROLE_STUDENT por padrão")
    void register_withoutRole_shouldDefaultToRoleStudent() {
        RegisterRequest request = RegisterRequest.builder()
                .username("student1")
                .email("s1@labflow.com")
                .password("pass1234")
                .build();

        when(userRepository.existsByUsername("student1")).thenReturn(false);
        when(userRepository.existsByEmail("s1@labflow.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(2L);
            return u;
        });

        authService.register(request);

        verify(userRepository).save(argThat(u -> "ROLE_STUDENT".equals(u.getRole())));
    }

    // ── login ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("login: credenciais válidas devem retornar AuthResponse com token")
    void login_validCredentials_shouldReturnToken() {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("secret")
                .build();

        User user = User.builder().id(1L).username("admin").role("ROLE_ADMIN").build();

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(1L, "admin", "ROLE_ADMIN")).thenReturn("jwt.token.here");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("jwt.token.here");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(86400L);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("login: credenciais inválidas devem propagar BadCredentialsException")
    void login_badCredentials_shouldThrow() {
        LoginRequest request = LoginRequest.builder()
                .username("nobody")
                .password("wrong")
                .build();

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }
}
