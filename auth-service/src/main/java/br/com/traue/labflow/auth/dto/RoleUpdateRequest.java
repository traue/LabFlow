package br.com.traue.labflow.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoleUpdateRequest {
    @NotBlank
    @Pattern(regexp = "ROLE_ADMIN|ROLE_PROF|ROLE_TA|ROLE_STUDENT",
             message = "Role must be one of: ROLE_ADMIN, ROLE_PROF, ROLE_TA, ROLE_STUDENT")
    private String role;
}
