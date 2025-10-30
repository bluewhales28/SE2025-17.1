package com.quizapp.user_auth_service.mapper;

import com.quizapp.user_auth_service.dto.request.UpdateUserRequest;
import com.quizapp.user_auth_service.dto.request.UserRequest;
import com.quizapp.user_auth_service.dto.response.UserResponse;
import com.quizapp.user_auth_service.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserRequest userRequest);

    @Mapping(source = "dateOfBirth", target = "dateOfBirth")
    @Mapping(source = "gender", target = "gender")
    @Mapping(source = "role", target = "role")
    UserResponse toUserReponse(User user);

    List<UserResponse> toUserResponseList(List<User> users);

    User updateUserRequestToUser(UpdateUserRequest updateUseRequest);


}