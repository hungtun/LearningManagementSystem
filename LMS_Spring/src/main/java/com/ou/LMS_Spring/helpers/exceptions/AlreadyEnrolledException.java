package com.ou.LMS_Spring.helpers.exceptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.resources.ErrorResource;

public class AlreadyEnrolledException extends ApiBusinessException {

    private static final String CODE = "code";

    public AlreadyEnrolledException() {
        super(HttpStatus.CONFLICT, buildError());
    }

    private static ErrorResource buildError() {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "ALREADY_ENROLLED");
        errors.put("message", "Already enrolled in this course");
        return new ErrorResource("Already enrolled", errors);
    }
}
