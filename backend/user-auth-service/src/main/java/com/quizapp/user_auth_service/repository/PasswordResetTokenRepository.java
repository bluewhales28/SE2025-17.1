package com.quizapp.user_auth_service.repository;

import com.quizapp.user_auth_service.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
	Optional<PasswordResetToken> findByToken(String token);
	long deleteByExpiresAtBefore(Instant instant);
}


