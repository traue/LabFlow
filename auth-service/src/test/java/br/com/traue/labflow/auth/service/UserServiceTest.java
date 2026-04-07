package br.com.traue.labflow.auth.service;

import br.com.traue.labflow.auth.dto.*;
import br.com.traue.labflow.auth.entity.Profile;
import br.com.traue.labflow.auth.entity.User;
import br.com.traue.labflow.auth.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService — testes unitários")
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private User userWithProfile(Long id, String username, String email) {
        User u = User.builder().id(id).username(username).email(email).role("ROLE_STUDENT").build();
        Profile p = Profile.builder().id(id).user(u).fullName(username).build();
        u.setProfile(p);
        return u;
    }

    // ── findAll ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll: deve mapear todos os usuários para UserResponse")
    void findAll_shouldReturnAllMapped() {
        when(userRepository.findAll()).thenReturn(List.of(
                userWithProfile(1L, "alice", "alice@test.com"),
                userWithProfile(2L, "bob", "bob@test.com")
        ));

        List<UserResponse> result = userService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserResponse::getUsername)
                .containsExactly("alice", "bob");
    }

    // ── findByIds ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findByIds: lista vazia deve retornar lista vazia sem consultar banco")
    void findByIds_emptyList_shouldReturnEmptyWithoutQuery() {
        List<UserResponse> result = userService.findByIds(List.of());

        assertThat(result).isEmpty();
        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("findByIds: deve retornar usuários correspondentes aos ids")
    void findByIds_withIds_shouldReturnMatchingUsers() {
        when(userRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(
                userWithProfile(1L, "alice", "alice@test.com"),
                userWithProfile(2L, "bob", "bob@test.com")
        ));

        List<UserResponse> result = userService.findByIds(List.of(1L, 2L));

        assertThat(result).hasSize(2);
    }

    // ── findById ─────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID existente deve retornar UserResponse correto")
    void findById_found_shouldReturnUser() {
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(userWithProfile(1L, "alice", "alice@test.com")));

        UserResponse response = userService.findById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("alice");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("findById: ID inexistente deve lançar IllegalArgumentException")
    void findById_notFound_shouldThrow() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── findByUsername ────────────────────────────────────────────────────────

    @Test
    @DisplayName("findByUsername: username existente deve retornar UserResponse correto")
    void findByUsername_found_shouldReturnUser() {
        when(userRepository.findByUsername("alice"))
                .thenReturn(Optional.of(userWithProfile(1L, "alice", "alice@test.com")));

        UserResponse response = userService.findByUsername("alice");

        assertThat(response.getUsername()).isEqualTo("alice");
        assertThat(response.getEmail()).isEqualTo("alice@test.com");
    }

    @Test
    @DisplayName("findByUsername: username inexistente deve lançar IllegalArgumentException")
    void findByUsername_notFound_shouldThrow() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findByUsername("ghost"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ghost");
    }

    // ── updateRole ────────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("updateRole: usuário encontrado deve ter a role atualizada")
    void updateRole_found_shouldUpdateAndReturn() {
        User user = userWithProfile(1L, "alice", "alice@test.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        UserResponse response = userService.updateRole(1L, "ROLE_PROF");

        assertThat(response.getRole()).isEqualTo("ROLE_PROF");
        verify(userRepository).save(user);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("updateRole: ID inexistente deve lançar IllegalArgumentException")
    void updateRole_notFound_shouldThrow() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateRole(99L, "ROLE_PROF"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── search ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("search: query com menos de 2 caracteres deve retornar lista vazia sem consultar banco")
    void search_shortQuery_shouldReturnEmptyWithoutQuery() {
        List<UserResponse> result = userService.search("a");

        assertThat(result).isEmpty();
        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("search: query válida deve retornar usuários filtrados")
    void search_validQuery_shouldReturnFilteredUsers() {
        String term = "%alice%";
        when(userRepository.searchByTerm(term))
                .thenReturn(List.of(userWithProfile(1L, "alice", "alice@test.com")));

        List<UserResponse> result = userService.search("alice");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("alice");
    }

    // ── importUsers ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("importUsers: usuário válido deve ser criado com sucesso")
    void importUsers_validUser_shouldSucceed() {
        RegisterRequest req = RegisterRequest.builder()
                .username("newstudent")
                .email("s@test.com")
                .password("pass123")
                .build();

        when(userRepository.existsByUsername("newstudent")).thenReturn(false);
        when(userRepository.existsByEmail("s@test.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        List<ImportUserResult> results = userService.importUsers(List.of(req));

        assertThat(results).hasSize(1);
        assertThat(results.get(0).isSuccess()).isTrue();
        assertThat(results.get(0).getUsername()).isEqualTo("newstudent");
    }

    @Test
    @DisplayName("importUsers: username duplicado deve registrar falha na importação")
    void importUsers_duplicateUsername_shouldFail() {
        RegisterRequest req = RegisterRequest.builder()
                .username("existing")
                .email("e@test.com")
                .password("pass123")
                .build();

        when(userRepository.existsByUsername("existing")).thenReturn(true);

        List<ImportUserResult> results = userService.importUsers(List.of(req));

        assertThat(results.get(0).isSuccess()).isFalse();
        assertThat(results.get(0).getMessage()).contains("já existe");
    }

    @Test
    @DisplayName("importUsers: username em branco deve registrar falha sem consultar banco")
    void importUsers_blankUsername_shouldFail() {
        RegisterRequest req = RegisterRequest.builder()
                .username("")
                .email("x@test.com")
                .build();

        List<ImportUserResult> results = userService.importUsers(List.of(req));

        assertThat(results.get(0).isSuccess()).isFalse();
        assertThat(results.get(0).getMessage()).contains("obrigatório");
    }
}
