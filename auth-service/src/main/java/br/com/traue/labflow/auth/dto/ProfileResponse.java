package br.com.traue.labflow.auth.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String phone;
    private String affiliation;
}
