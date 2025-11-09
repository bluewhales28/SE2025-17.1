package com.quizapp.user_auth_service.service.impl;

import com.quizapp.user_auth_service.dto.request.UpdateUserRequest;
import com.quizapp.user_auth_service.dto.request.UserRequest;
import com.quizapp.user_auth_service.dto.response.PageResponse;
import com.quizapp.user_auth_service.dto.response.UserResponse;
import com.quizapp.user_auth_service.exception.AppException;
import com.quizapp.user_auth_service.exception.ErrorCode;
import com.quizapp.user_auth_service.mapper.UserMapper;
import com.quizapp.user_auth_service.model.User;
import com.quizapp.user_auth_service.repository.UserRepository;
import com.quizapp.user_auth_service.service.PasswordService;
import com.quizapp.user_auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordService passwordService;

    @Override
    public PageResponse<?> findByFullName(String fullName, int page, int size) {
        if (!userRepository.existsByFullName(fullName)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));

        Page<User> users = userRepository.findUsersByFullNameContaining(fullName, pageable);

        return converToPageResponse(users, pageable);
    }

    @Override
    public UserResponse save(UserRequest userRequest) {
        // Check if user already exists
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(userRequest);
        // Hash the password before saving
        user.setPasswordHash(passwordService.hashPassword(userRequest.getPasswordHash()));
        // Email is always verified when creating new user
        user.setEmailVerified(true);
        
        try {
            user = userRepository.save(user);
        } catch (Exception e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserReponse(user);
    }


    @Override
    public void update(Long id, UpdateUserRequest updateUserRequest) {
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setFullName(updateUserRequest.getFullName());
        user.setEmail(updateUserRequest.getEmail());
        // Hash the password if it's being updated
        if (updateUserRequest.getPasswordHash() != null && !updateUserRequest.getPasswordHash().isEmpty()) {
            user.setPasswordHash(passwordService.hashPassword(updateUserRequest.getPasswordHash()));
        }
        user.setPhoneNumber(updateUserRequest.getPhoneNumber());
        user.setDateOfBirth(updateUserRequest.getDateOfBirth());
        userRepository.save(user);
    }


    @Override
    public PageResponse<?> findAll(int page, int size, String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, sortBy));
        Page<User> users = userRepository.findAll(pageable);
        return converToPageResponse(users, pageable);
    }

    private PageResponse<?> converToPageResponse(Page<User> users, Pageable pageable) {
        List<UserResponse> userList = userMapper.toUserResponseList(users.getContent());
        return PageResponse.<List<UserResponse>>builder()
                .page(users.getNumber()) // Trang hiện tại
                .size(users.getSize()) // Số phần tử mỗi trang
                .total(users.getTotalElements()) // Tổng số phần tử
                .totalPages(users.getTotalPages()) // Tổng số trang
                .hasNext(users.hasNext()) // Có trang tiếp theo không?
                .hasPrevious(users.hasPrevious()) // Có trang trước không?
                .items(userList)
                .build();
    }

    @Override
    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserReponse(user);
    }

    @Override
    public UserResponse updateProfile(String email, UpdateUserRequest updateUserRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setFullName(updateUserRequest.getFullName());
        user.setPhoneNumber(updateUserRequest.getPhoneNumber());
        user.setDateOfBirth(updateUserRequest.getDateOfBirth());
        
        // Hash the password if it's being updated
        if (updateUserRequest.getPasswordHash() != null && !updateUserRequest.getPasswordHash().isEmpty()) {
            user.setPasswordHash(passwordService.hashPassword(updateUserRequest.getPasswordHash()));
        }
        
        user = userRepository.save(user);
        return userMapper.toUserReponse(user);
    }
}
