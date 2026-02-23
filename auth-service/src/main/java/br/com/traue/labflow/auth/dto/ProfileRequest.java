package br.com.traue.labflow.auth.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileRequest {
    private String fullName;
    private String phone;
    private String affiliation;
}
