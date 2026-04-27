package com.ou.LMS_Spring.helpers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.ou.LMS_Spring.resources.ErrorResource;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final String CODE = "code";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object>  handleValidationExceptions(MethodArgumentNotValidException ex){
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "VALIDATION_ERROR");

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError)error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResource errorResource = new ErrorResource("Validation failed", errors);

        return new ResponseEntity<>(errorResource, HttpStatus.UNPROCESSABLE_CONTENT);
    }

    @ExceptionHandler(ApiBusinessException.class)
    public ResponseEntity<ErrorResource> handleApiBusiness(ApiBusinessException ex) {
        return ResponseEntity.status(ex.getStatus()).body(ex.getErrorResource());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResource> handleBadCredentials(BadCredentialsException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "INVALID_CREDENTIALS");
        errors.put("message", ex.getMessage() != null ? ex.getMessage() : "Authentication failed");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResource("Authentication failed", errors));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResource> handleIllegalState(IllegalStateException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage() != null ? ex.getMessage() : "Unexpected error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResource("Server error", errors));
    }
}
