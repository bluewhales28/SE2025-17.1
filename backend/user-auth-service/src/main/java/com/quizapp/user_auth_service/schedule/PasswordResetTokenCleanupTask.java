package com.quizapp.user_auth_service.schedule;

import com.quizapp.user_auth_service.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class PasswordResetTokenCleanupTask {

	private final PasswordResetTokenRepository tokenRepository;

	// Run every hour
	@Scheduled(cron = "0 0 * * * *")
	public void cleanExpiredTokens() {
		long removed = tokenRepository.deleteByExpiresAtBefore(Instant.now());
		if (removed > 0) {
			log.info("Cleaned {} expired password reset tokens", removed);
		}
	}
}


