package br.com.traue.labflow.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtTokenProvider — testes unitários")
class JwtTokenProviderTest {

    private static final String SECRET =
            "superSecretKeyForLabFlowJwtTokenGeneration2025TestUnit!!";
    private static final long EXPIRATION_MS = 3_600_000L; // 1 hora

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, EXPIRATION_MS);
    }

    @Test
    @DisplayName("generateToken: deve retornar um token JWT não nulo e não vazio")
    void generateToken_shouldReturnNonBlankJwt() {
        String token = jwtTokenProvider.generateToken(1L, "alice", "ROLE_ADMIN");

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // header.payload.signature
    }

    @Test
    @DisplayName("getUserIdFromToken: deve extrair o ID correto do token")
    void getUserIdFromToken_shouldReturnCorrectId() {
        String token = jwtTokenProvider.generateToken(42L, "alice", "ROLE_STUDENT");

        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        assertThat(userId).isEqualTo(42L);
    }

    @Test
    @DisplayName("getUsernameFromToken: deve extrair o username correto do token")
    void getUsernameFromToken_shouldReturnCorrectUsername() {
        String token = jwtTokenProvider.generateToken(1L, "bob", "ROLE_PROF");

        String username = jwtTokenProvider.getUsernameFromToken(token);

        assertThat(username).isEqualTo("bob");
    }

    @Test
    @DisplayName("getRolesFromToken: deve extrair a lista de roles corretamente")
    void getRolesFromToken_shouldReturnRolesList() {
        String token = jwtTokenProvider.generateToken(1L, "profuser", "ROLE_PROF");

        List<String> roles = jwtTokenProvider.getRolesFromToken(token);

        assertThat(roles).containsExactly("ROLE_PROF");
    }

    @Test
    @DisplayName("validateToken: token válido deve retornar true")
    void validateToken_validToken_shouldReturnTrue() {
        String token = jwtTokenProvider.generateToken(1L, "alice", "ROLE_STUDENT");

        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
    }

    @Test
    @DisplayName("validateToken: token modificado deve retornar false")
    void validateToken_tamperedToken_shouldReturnFalse() {
        String token = jwtTokenProvider.generateToken(1L, "alice", "ROLE_STUDENT");
        String tampered = token.substring(0, token.length() - 10) + "TAMPERED!!";

        assertThat(jwtTokenProvider.validateToken(tampered)).isFalse();
    }

    @Test
    @DisplayName("validateToken: string aleatória deve retornar false")
    void validateToken_invalidString_shouldReturnFalse() {
        assertThat(jwtTokenProvider.validateToken("not.a.jwt")).isFalse();
    }

    @Test
    @DisplayName("getExpirationMs: deve retornar o valor configurado")
    void getExpirationMs_shouldReturnConfiguredValue() {
        assertThat(jwtTokenProvider.getExpirationMs()).isEqualTo(EXPIRATION_MS);
    }
}
