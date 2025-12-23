package com.quizapp.user_auth_service.dto.request;

import com.quizapp.user_auth_service.untils.Gender;
import com.quizapp.user_auth_service.untils.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserRequest implements Serializable {

    @NotBlank(message = "email must not blank")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "email should be valid")
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

    @NotNull(message ="gender cannot be null")
    private Gender gender;

    @NotNull(message = "role cannot be null")
    private Role role;

}
