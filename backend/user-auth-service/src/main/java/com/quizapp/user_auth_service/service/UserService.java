package com.quizapp.user_auth_service.service;

import com.quizapp.user_auth_service.dto.request.UpdateUserRequest;
import com.quizapp.user_auth_service.dto.request.UserRequest;
import com.quizapp.user_auth_service.dto.response.PageResponse;
import com.quizapp.user_auth_service.dto.response.UserResponse;

public interface UserService {
    PageResponse<?> findByFullName(String fullName, int page, int size);

    UserResponse save(UserRequest userRequest);

    void update(Long id, UpdateUserRequest updateUserRequest);

    PageResponse<?> findAll(int page, int size, String sortBy);
    
    UserResponse findByEmail(String email);
    
    UserResponse updateProfile(String email, UpdateUserRequest updateUserRequest);
}
