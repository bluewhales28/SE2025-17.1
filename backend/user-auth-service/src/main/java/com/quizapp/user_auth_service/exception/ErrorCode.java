package com.quizapp.user_auth_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    USER_EXISTED(400, "User existed", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(404, "User not found", HttpStatus.NOT_FOUND),
    INVALID_CREDENTIALS(401, "Invalid credentials", HttpStatus.UNAUTHORIZED),
    MOVIE_NOT_FOUND(404, "Movie not found", HttpStatus.NOT_FOUND),
    MOVIE_EXISTED(400, "Movie existed", HttpStatus.BAD_REQUEST),
    GENRE_EXISTED(400, "Genre existed", HttpStatus.BAD_REQUEST),
    TOKEN_GENERATION_FAILED(500, "Failed to generate token", HttpStatus.INTERNAL_SERVER_ERROR),
    MALFORMED_TOKEN(400, "Malformed token", HttpStatus.BAD_REQUEST),
    INVALID_SIGNATURE(401, "Invalid signature", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(401, "Token expired", HttpStatus.UNAUTHORIZED),
    TOKEN_MISSING(400, "Token is missing", HttpStatus.BAD_REQUEST),
    UNEXPECTED_ERROR(500, "Unexpected error", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED(403, "You do not have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(401, "Unauthenticated", HttpStatus.UNAUTHORIZED)
    ;





    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

}
