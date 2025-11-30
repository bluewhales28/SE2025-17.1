package com.quizapp.user_auth_service.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailEvent {
	private String email;
	private String type; // PASSWORD_RESET
	private String subject;
	private String token;
	private String frontendUrl;
	private Long userId;
}


