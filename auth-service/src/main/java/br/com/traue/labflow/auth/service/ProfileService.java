package br.com.traue.labflow.auth.service;

import br.com.traue.labflow.auth.dto.*;
import br.com.traue.labflow.auth.entity.Profile;
import br.com.traue.labflow.auth.entity.User;
import br.com.traue.labflow.auth.repository.ProfileRepository;
import br.com.traue.labflow.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileResponse getByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user: " + userId));
        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
                    return Profile.builder().user(user).build();
                });

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAffiliation() != null) profile.setAffiliation(request.getAffiliation());

        profile = profileRepository.save(profile);
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
