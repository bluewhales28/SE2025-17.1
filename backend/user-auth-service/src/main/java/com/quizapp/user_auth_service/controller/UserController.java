package com.quizapp.user_auth_service.controller;

import com.quizapp.user_auth_service.dto.request.UpdateUserRequest;
import com.quizapp.user_auth_service.dto.request.UserRequest;
import com.quizapp.user_auth_service.dto.response.ApiResponse;
import com.quizapp.user_auth_service.dto.response.PageResponse;
import com.quizapp.user_auth_service.dto.response.UserResponse;
import com.quizapp.user_auth_service.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@Validated
@RequiredArgsConstructor  // Lombok tự động tạo constructor
@Slf4j
public class UserController {
    private final UserService userService;

    @GetMapping()
    public ApiResponse<?> getUserByFullName(@RequestParam("fullName") String fullName,
                                            @RequestParam(defaultValue = "0", required = false) int page,
                                            @Min(5) @RequestParam(defaultValue = "20", required = false) int size) {

        PageResponse<?> userResponse = userService.findByFullName(fullName, page, size);

        return ApiResponse.<PageResponse<?>>builder()
                .status(HttpStatus.OK.value())
                .message("Get User by full name successfully")
                .data(userResponse)
                .build();
    }

    @PostMapping
    public ApiResponse<UserResponse> creationUser(@RequestBody @Valid UserRequest userRequest) {
        UserResponse userResponse = userService.save(userRequest);

        return ApiResponse.<UserResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("User created successfully")
                .data(userResponse)
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<?> getAllUsers(@RequestParam(defaultValue = "0", required = false) int page,
                                      @Min(5) @RequestParam(defaultValue = "20", required = false) int size,
                                      @RequestParam String sortBy) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Username: {}",auth.getName());
        auth.getAuthorities().forEach(role -> log.info(role.getAuthority()));


        PageResponse<?> userResponses = userService.findAll(page, size, sortBy);


        return ApiResponse.<PageResponse<?>>builder()
                .status(HttpStatus.OK.value())
                .message("Get all users successfully")
                .data(userResponses)
                .build();

    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateUser(@PathVariable Long id,@Valid @RequestBody UpdateUserRequest updateUserRequest) {
        userService.update(id, updateUserRequest);

        return ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Update user successfully")
                .build();

    }

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getCurrentUserProfile() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        UserResponse userResponse = userService.findByEmail(email);
        
        return ApiResponse.<UserResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Profile retrieved successfully")
                .data(userResponse)
                .build();
    }

    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateCurrentUserProfile(@Valid @RequestBody UpdateUserRequest updateUserRequest) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        UserResponse userResponse = userService.updateProfile(email, updateUserRequest);
        
        return ApiResponse.<UserResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Profile updated successfully")
                .data(userResponse)
                .build();
    }
}