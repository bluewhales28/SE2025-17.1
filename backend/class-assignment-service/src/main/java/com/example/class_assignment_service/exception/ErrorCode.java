package com.example.class_assignment_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // Class errors
    CLASS_NOT_FOUND(404, "Class not found", HttpStatus.NOT_FOUND),
    CLASS_ALREADY_EXISTS(409, "Class already exists", HttpStatus.CONFLICT),
    UNAUTHORIZED_CLASS_ACCESS(403, "Unauthorized access to class", HttpStatus.FORBIDDEN),
    
    // Member errors
    MEMBER_NOT_FOUND(404, "Member not found", HttpStatus.NOT_FOUND),
    MEMBER_ALREADY_EXISTS(409, "Member already exists in class", HttpStatus.CONFLICT),
    INVALID_ROLE(400, "Invalid role for this operation", HttpStatus.BAD_REQUEST),
    CANNOT_REMOVE_LAST_TEACHER(400, "Cannot remove the last teacher from class", HttpStatus.BAD_REQUEST),
    
    // Assignment errors
    ASSIGNMENT_NOT_FOUND(404, "Assignment not found", HttpStatus.NOT_FOUND),
    ASSIGNMENT_DEADLINE_PASSED(400, "Assignment deadline has passed", HttpStatus.BAD_REQUEST),
    MAX_ATTEMPTS_REACHED(400, "Maximum attempts reached for this assignment", HttpStatus.BAD_REQUEST),
    ASSIGNMENT_NOT_OPEN(400, "Assignment is not open yet", HttpStatus.BAD_REQUEST),
    ASSIGNMENT_CLOSED(400, "Assignment is closed", HttpStatus.BAD_REQUEST),
    
    // Invitation errors
    INVITATION_NOT_FOUND(404, "Invitation not found", HttpStatus.NOT_FOUND),
    INVITATION_EXPIRED(400, "Invitation has expired", HttpStatus.BAD_REQUEST),
    INVITATION_ALREADY_ACCEPTED(409, "Invitation already accepted", HttpStatus.CONFLICT),
    INVITATION_CODE_INVALID(400, "Invalid invitation code", HttpStatus.BAD_REQUEST),
    
    // Quiz Service errors
    QUIZ_NOT_FOUND(404, "Quiz not found in Quiz Service", HttpStatus.NOT_FOUND),
    QUIZ_SERVICE_ERROR(503, "Quiz Service unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    
    // Notification Service errors
    NOTIFICATION_SERVICE_ERROR(503, "Notification Service unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    
    // General errors
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden", HttpStatus.FORBIDDEN),
    VALIDATION_ERROR(400, "Validation error", HttpStatus.BAD_REQUEST),
    INTERNAL_SERVER_ERROR(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    
    private final int code;
    private final String message;
    private final HttpStatus httpStatus;
    
    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

