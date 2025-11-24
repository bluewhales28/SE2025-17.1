package com.quizapp.user_auth_service.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "invalid_tokens")
public class InvalidToken extends BaseEntity<Long> {
    private String token;
    private Date expirationTime;
}
