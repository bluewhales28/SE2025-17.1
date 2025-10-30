package com.quizapp.user_auth_service.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.List;

@RestControllerAdvice
public class GlobalException {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {

        List<String> errors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation Failed");
        problemDetail.setTitle("Validation Exception");
        problemDetail.setType(URI.create(request.getRequestURI()));
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("errors", errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ProblemDetail> handleIdentityException(AppException exception, HttpServletRequest request) {
        ErrorCode errorCode = exception.getErrorCode();

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(errorCode.getHttpStatus(), errorCode.getMessage());
        problemDetail.setTitle("Application Exception");
        problemDetail.setType(URI.create(request.getRequestURI()));
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("errors", List.of(errorCode.getMessage()));

        return ResponseEntity.status(errorCode.getHttpStatus()).body(problemDetail);
    }


}