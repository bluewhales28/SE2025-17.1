package com.quizapp.user_auth_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final String[] PUBLIC_URL = {
        "/auth/login",
        "/auth/introspect",
        "/auth/logout",
        "/auth/refresh",
        "/users"
    };
    private final CustomJwtDecoder jwtDecoder;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests.requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                                .requestMatchers(HttpMethod.POST, "/users").permitAll()
                                .requestMatchers(HttpMethod.POST, "/auth/introspect").permitAll()
                                .requestMatchers(HttpMethod.POST, "/auth/logout").permitAll()
                                .requestMatchers(HttpMethod.POST, "/auth/refresh").permitAll()
                                .requestMatchers(HttpMethod.GET, "/users").hasAnyAuthority("SCOPE_user:read")
                                .requestMatchers(HttpMethod.GET, "/users/all").hasAnyAuthority("SCOPE_admin:read")
                                .requestMatchers(HttpMethod.GET, "/users/profile").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/users/profile").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/users/**").hasAnyAuthority("SCOPE_user:write", "SCOPE_admin:write")
                                .requestMatchers(HttpMethod.DELETE, "/users/**").hasAnyAuthority("SCOPE_admin:delete")
                                .anyRequest().authenticated()
                );

        // Cấu hình JWT resource server
        httpSecurity.oauth2ResourceServer(oauth2ResourceServer ->
                oauth2ResourceServer.jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder)));

        httpSecurity.exceptionHandling(exceptionHandling ->
                exceptionHandling
                        .accessDeniedHandler(new CustomAccessDeniedHandler())
                        .authenticationEntryPoint(new CustomJwtAuthentited())
        );

        httpSecurity.cors(org.springframework.security.config.Customizer.withDefaults());
        httpSecurity.csrf(httpSecurityCsrfConfigurer -> httpSecurityCsrfConfigurer.disable());
        return httpSecurity.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
