package com.ou.LMS_Spring.helpers.exceptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.resources.ErrorResource;

public class CourseRosterForbiddenException extends ApiBusinessException {

    private static final String CODE = "code";

    public CourseRosterForbiddenException() {
        super(HttpStatus.FORBIDDEN, buildError());
    }

    private static ErrorResource buildError() {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "FORBIDDEN");
        errors.put("message", "Not allowed to view this course roster");
        return new ErrorResource("Forbidden", errors);
    }
}
