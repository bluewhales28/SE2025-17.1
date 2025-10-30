package com.quizapp.user_auth_service.model;

import com.quizapp.user_auth_service.untils.Gender;
import com.quizapp.user_auth_service.untils.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User  extends BaseEntity<Long> {


    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Builder.Default
    @Column(name = "is_email_verified", nullable = false)
    private boolean isEmailVerified = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;




}