package com.quizapp.user_auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
	@NotBlank
	private String token;

	@NotBlank
	private String newPassword;
}


