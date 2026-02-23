package br.com.traue.labflow.auth.service;

import br.com.traue.labflow.auth.dto.*;
import br.com.traue.labflow.auth.entity.Profile;
import br.com.traue.labflow.auth.entity.User;
import br.com.traue.labflow.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<UserResponse> findByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return userRepository.findAllById(ids).stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse findById(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return toResponse(user);
    }

    public UserResponse findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateRole(@NonNull Long id, @NonNull String newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setRole(newRole);
        return toResponse(userRepository.save(Objects.requireNonNull(user)));
    }

    public List<UserResponse> search(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        String term = "%" + query.trim().toLowerCase() + "%";
        return userRepository.searchByTerm(term).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<ImportUserResult> importUsers(List<RegisterRequest> requests) {
        List<ImportUserResult> results = new ArrayList<>();
        for (RegisterRequest req : requests) {
            try {
                if (req.getUsername() == null || req.getUsername().isBlank()) {
                    results.add(ImportUserResult.builder()
                            .username(req.getUsername())
                            .success(false)
                            .message("Username é obrigatório")
                            .build());
                    continue;
                }
                if (userRepository.existsByUsername(req.getUsername())) {
                    results.add(ImportUserResult.builder()
                            .username(req.getUsername())
                            .success(false)
                            .message("Username já existe")
                            .build());
                    continue;
                }
                if (req.getEmail() != null && userRepository.existsByEmail(req.getEmail())) {
                    results.add(ImportUserResult.builder()
                            .username(req.getUsername())
                            .success(false)
                            .message("E-mail já existe")
                            .build());
                    continue;
                }

                String role = (req.getRole() != null && !req.getRole().isBlank())
                        ? req.getRole() : "ROLE_STUDENT";
                String password = (req.getPassword() != null && !req.getPassword().isBlank())
                        ? req.getPassword() : req.getUsername() + "123";

                User user = User.builder()
                        .username(req.getUsername())
                        .email(req.getEmail())
                        .passwordHash(passwordEncoder.encode(password))
                        .role(role)
                        .build();

                Profile profile = Profile.builder()
                        .user(user)
                        .fullName(req.getUsername())
                        .build();
                user.setProfile(profile);

                userRepository.save(Objects.requireNonNull(user));

                results.add(ImportUserResult.builder()
                        .username(req.getUsername())
                        .success(true)
                        .message("Criado com sucesso")
                        .build());
            } catch (Exception e) {
                results.add(ImportUserResult.builder()
                        .username(req.getUsername())
                        .success(false)
                        .message(e.getMessage())
                        .build());
            }
        }
        return results;
    }

    private UserResponse toResponse(User u) {
        ProfileResponse profileResp = null;
        if (u.getProfile() != null) {
            Profile p = u.getProfile();
            profileResp = ProfileResponse.builder()
                    .id(p.getId())
                    .userId(u.getId())
                    .fullName(p.getFullName())
                    .phone(p.getPhone())
                    .affiliation(p.getAffiliation())
                    .build();
        }
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole())
                .profile(profileResp)
                .build();
    }
}
