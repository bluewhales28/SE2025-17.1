package com.quizapp.user_auth_service.service.impl;

import com.quizapp.user_auth_service.dto.event.EmailEvent;
import com.quizapp.user_auth_service.dto.request.ForgotPasswordRequest;
import com.quizapp.user_auth_service.dto.request.ResetPasswordRequest;
import com.quizapp.user_auth_service.exception.AppException;
import com.quizapp.user_auth_service.exception.ErrorCode;
import com.quizapp.user_auth_service.model.PasswordResetToken;
import com.quizapp.user_auth_service.model.User;
import com.quizapp.user_auth_service.queue.EmailQueueProducer;
import com.quizapp.user_auth_service.repository.PasswordResetTokenRepository;
import com.quizapp.user_auth_service.repository.UserRepository;
import com.quizapp.user_auth_service.service.PasswordResetService;
import com.quizapp.user_auth_service.service.PasswordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

	private final UserRepository userRepository;
	private final PasswordResetTokenRepository tokenRepository;
	private final EmailQueueProducer emailQueueProducer;
	private final PasswordService passwordService;

	@Value("${app.frontend.url}")
	private String frontendUrl;

	@Override
    public void requestPasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        // Không tiết lộ email có tồn tại hay không để tránh user enumeration
        if (user == null) {
            log.info("Password reset requested for non-existing email={}, returning 200", request.getEmail());
            return;
        }

		String token = UUID.randomUUID().toString();
		Instant expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);

		PasswordResetToken resetToken = PasswordResetToken.builder()
				.token(token)
				.user(user)
				.expiresAt(expiresAt)
				.used(false)
				.build();
		tokenRepository.save(resetToken);

		EmailEvent event = EmailEvent.builder()
				.email(user.getEmail())
				.type("PASSWORD_RESET")
				.subject("Password Reset Request - Quiz App")
				.token(token)
				.frontendUrl(frontendUrl + "/reset-password?token=" + token)
				.userId(user.getId())
				.build();
		emailQueueProducer.publishEmailEvent(event);

		log.info("Password reset token generated for userId={}, expiresAt={}", user.getId(), expiresAt);
	}

	@Override
	public void resetPassword(ResetPasswordRequest request) {
		PasswordResetToken token = tokenRepository.findByToken(request.getToken())
				.orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

		if (token.isUsed()) {
			throw new AppException(ErrorCode.UNAUTHENTICATED);
		}
		if (token.getExpiresAt().isBefore(Instant.now())) {
			throw new AppException(ErrorCode.UNAUTHENTICATED);
		}

		User user = token.getUser();
		user.setPasswordHash(passwordService.hashPassword(request.getNewPassword()));
		userRepository.save(user);

		token.setUsed(true);
		tokenRepository.save(token);

		log.info("Password updated via reset for userId={}", user.getId());
	}
}


