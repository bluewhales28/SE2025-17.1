package com.quizapp.user_auth_service.service;

import com.quizapp.user_auth_service.dto.request.ForgotPasswordRequest;
import com.quizapp.user_auth_service.dto.request.ResetPasswordRequest;

public interface PasswordResetService {
	void requestPasswordReset(ForgotPasswordRequest request);
	void resetPassword(ResetPasswordRequest request);
}


