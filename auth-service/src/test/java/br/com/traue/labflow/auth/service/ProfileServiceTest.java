package br.com.traue.labflow.auth.service;

import br.com.traue.labflow.auth.dto.ProfileRequest;
import br.com.traue.labflow.auth.dto.ProfileResponse;
import br.com.traue.labflow.auth.entity.Profile;
import br.com.traue.labflow.auth.entity.User;
import br.com.traue.labflow.auth.repository.ProfileRepository;
import br.com.traue.labflow.auth.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProfileService — testes unitários")
class ProfileServiceTest {

    @Mock private ProfileRepository profileRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private ProfileService profileService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private User stubUser(Long id) {
        return User.builder().id(id).username("user" + id).email(id + "@test.com").role("ROLE_STUDENT").build();
    }

    private Profile stubProfile(Long userId) {
        User user = stubUser(userId);
        return Profile.builder().id(userId).user(user).fullName("Full Name").phone("99999").affiliation("UFMG").build();
    }

    // ── getByUserId ──────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("getByUserId: perfil existente deve ser mapeado corretamente")
    void getByUserId_exists_shouldReturnProfileResponse() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(stubProfile(1L)));

        ProfileResponse response = profileService.getByUserId(1L);

        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getFullName()).isEqualTo("Full Name");
        assertThat(response.getPhone()).isEqualTo("99999");
        assertThat(response.getAffiliation()).isEqualTo("UFMG");
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("getByUserId: perfil inexistente deve lançar IllegalArgumentException")
    void getByUserId_notFound_shouldThrow() {
        when(profileRepository.findByUserId(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> profileService.getByUserId(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    // ── updateProfile ────────────────────────────────────────────────────────

    @Test
    @SuppressWarnings("null")
    @DisplayName("updateProfile: perfil existente deve ter campos atualizados")
    void updateProfile_existingProfile_shouldPatchFields() {
        Profile existing = stubProfile(1L);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(existing));
        when(profileRepository.save(any(Profile.class))).thenAnswer(inv -> inv.getArgument(0));

        ProfileRequest request = ProfileRequest.builder()
                .fullName("Novo Nome")
                .phone("88888")
                .affiliation("USP")
                .build();

        ProfileResponse response = profileService.updateProfile(1L, request);

        assertThat(response.getFullName()).isEqualTo("Novo Nome");
        assertThat(response.getPhone()).isEqualTo("88888");
        assertThat(response.getAffiliation()).isEqualTo("USP");
        verify(profileRepository).save(existing);
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("updateProfile: sem perfil existente deve criar novo perfil para o usuário")
    void updateProfile_noProfileYet_shouldCreateAndUpdate() {
        User user = stubUser(2L);
        when(profileRepository.findByUserId(2L)).thenReturn(Optional.empty());
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(profileRepository.save(any(Profile.class))).thenAnswer(inv -> {
            Profile p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        ProfileRequest request = ProfileRequest.builder().fullName("Nome Novo").build();

        ProfileResponse response = profileService.updateProfile(2L, request);

        assertThat(response.getFullName()).isEqualTo("Nome Novo");
        verify(profileRepository).save(any(Profile.class));
    }

    @Test
    @SuppressWarnings("null")
    @DisplayName("updateProfile: campos nulos no request não devem sobrescrever valores existentes")
    void updateProfile_nullFields_shouldNotOverwrite() {
        Profile existing = stubProfile(1L);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(existing));
        when(profileRepository.save(any(Profile.class))).thenAnswer(inv -> inv.getArgument(0));

        // Only fullName provided — phone and affiliation must stay
        ProfileRequest request = ProfileRequest.builder().fullName("Apenas Nome").build();

        ProfileResponse response = profileService.updateProfile(1L, request);

        assertThat(response.getFullName()).isEqualTo("Apenas Nome");
        assertThat(response.getPhone()).isEqualTo("99999");
        assertThat(response.getAffiliation()).isEqualTo("UFMG");
    }
}
