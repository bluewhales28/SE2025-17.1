package com.quizapp.user_auth_service.repository;

import com.quizapp.user_auth_service.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
	Optional<PasswordResetToken> findByToken(String token);
	
	@Modifying
	@Query("DELETE FROM PasswordResetToken p WHERE p.expiresAt < :instant")
	int deleteByExpiresAtBefore(@Param("instant") Instant instant);
}


