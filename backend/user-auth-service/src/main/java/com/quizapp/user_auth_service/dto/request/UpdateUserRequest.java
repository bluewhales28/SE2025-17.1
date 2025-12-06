package com.quizapp.user_auth_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UpdateUserRequest {
    @NotBlank(message = "email must not blank")
    @Email(message = "email should be valid")
    private String email;

    @NotBlank(message = "password must not blank")
    @Size(min = 6, message = "password should have at least 6 characters")
    private String password;

    @NotBlank(message = "full name must not blank")
    private String fullName;

    @NotBlank(message = "phone number must not blank")
    @Size(min = 10, message = "phone number should have at least 10 characters")
    private String phoneNumber;

    @NotNull(message = "date of birth must not blank")
    private LocalDate dateOfBirth;

}
