package com.quizapp.user_auth_service.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Configuration class để setup beans cho các dịch vụ khác
 */
@Configuration
public class AppConfig {

    /**
     * Cung cấp RestTemplate bean cho HTTP requests
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(5000)
            .setReadTimeout(10000)
            .build();
    }

    /**
     * Cung cấp ObjectMapper bean cho JSON serialization/deserialization
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
