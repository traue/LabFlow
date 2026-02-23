package br.com.traue.labflow.auth.service;

import br.com.traue.labflow.auth.dto.*;
import br.com.traue.labflow.auth.entity.Profile;
import br.com.traue.labflow.auth.entity.User;
import br.com.traue.labflow.auth.repository.ProfileRepository;
import br.com.traue.labflow.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileResponse getByUserId(@NonNull Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user: " + userId));
        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(@NonNull Long userId, @NonNull ProfileRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(Objects.requireNonNull(userId))
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
                    return Profile.builder().user(user).build();
                });

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAffiliation() != null) profile.setAffiliation(request.getAffiliation());

        profile = profileRepository.save(Objects.requireNonNull(profile));
        return toResponse(profile);
    }

    private ProfileResponse toResponse(Profile p) {
        return ProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .fullName(p.getFullName())
                .phone(p.getPhone())
                .affiliation(p.getAffiliation())
                .build();
    }
}
