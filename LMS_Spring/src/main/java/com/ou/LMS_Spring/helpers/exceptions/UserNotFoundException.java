package com.ou.LMS_Spring.helpers.exceptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.resources.ErrorResource;

public class UserNotFoundException extends ApiBusinessException {

    private static final String CODE = "code";

    public UserNotFoundException() {
        super(HttpStatus.UNAUTHORIZED, buildError());
    }

    private static ErrorResource buildError() {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "USER_NOT_FOUND");
        errors.put("message", "No user for this session");
        return new ErrorResource("User not found", errors);
    }
}
