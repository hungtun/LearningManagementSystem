package com.ou.LMS_Spring.helpers.exceptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.resources.ErrorResource;

public class CourseNotFoundException extends ApiBusinessException {

    private static final String CODE = "code";

    public CourseNotFoundException(Long courseId) {
        super(HttpStatus.NOT_FOUND, buildError(courseId));
    }

    private static ErrorResource buildError(Long courseId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "COURSE_NOT_FOUND");
        errors.put("courseId", "No course with id: " + courseId);
        return new ErrorResource("Course not found", errors);
    }
}
