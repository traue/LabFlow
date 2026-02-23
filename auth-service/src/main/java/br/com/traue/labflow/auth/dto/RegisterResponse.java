package br.com.traue.labflow.auth.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterResponse {
    private Long id;
    private String username;
    private String email;
}
