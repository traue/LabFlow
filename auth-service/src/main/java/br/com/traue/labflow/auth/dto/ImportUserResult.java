package br.com.traue.labflow.auth.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImportUserResult {
    private String username;
    private boolean success;
    private String message;
}
