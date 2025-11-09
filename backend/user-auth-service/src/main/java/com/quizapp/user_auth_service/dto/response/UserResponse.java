package com.quizapp.user_auth_service.dto.response;

import com.quizapp.user_auth_service.untils.Gender;
import com.quizapp.user_auth_service.untils.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Setter
@Builder
public class UserResponse implements Serializable {
    Long id;
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private Role role;

}
