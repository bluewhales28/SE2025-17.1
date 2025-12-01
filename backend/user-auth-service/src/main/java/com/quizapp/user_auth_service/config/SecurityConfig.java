package com.quizapp.user_auth_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final String[] PUBLIC_URL = {
        "/auth/login",
        "/auth/introspect",
        "/auth/logout",
        "/auth/refresh",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/users"
    };
    private final CustomJwtDecoder jwtDecoder;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(httpSecurityCsrfConfigurer -> httpSecurityCsrfConfigurer.disable())
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers(HttpMethod.POST, PUBLIC_URL).permitAll()
                                .requestMatchers("/error").permitAll()
                                .requestMatchers(HttpMethod.GET, "/users").hasAnyAuthority("SCOPE_user:read")
                                .requestMatchers(HttpMethod.GET, "/users/all").hasAnyAuthority("SCOPE_admin:read")
                                .requestMatchers(HttpMethod.GET, "/users/profile").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/users/profile").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/users/**").hasAnyAuthority("SCOPE_user:write", "SCOPE_admin:write")
                                .requestMatchers(HttpMethod.DELETE, "/users/**").hasAnyAuthority("SCOPE_admin:delete")
                                .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2ResourceServer ->
                        oauth2ResourceServer
                                .jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder))
                                .authenticationEntryPoint(new CustomJwtAuthentited())
                )
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.accessDeniedHandler(new CustomAccessDeniedHandler())
                );

        return httpSecurity.build();
    }

}
