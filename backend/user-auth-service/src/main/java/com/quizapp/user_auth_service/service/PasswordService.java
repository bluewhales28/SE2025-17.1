package com.quizapp.user_auth_service.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
    
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public String hashPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
    
    public boolean verifyPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}
