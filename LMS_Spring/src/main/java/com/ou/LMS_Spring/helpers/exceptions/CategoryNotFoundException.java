package com.ou.LMS_Spring.helpers.exceptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.resources.ErrorResource;

public class CategoryNotFoundException extends ApiBusinessException {

    private static final String CODE = "code";

    public CategoryNotFoundException(Long categoryId) {
        super(HttpStatus.NOT_FOUND, buildError(categoryId));
    }

    private static ErrorResource buildError(Long categoryId) {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "CATEGORY_NOT_FOUND");
        errors.put("categoryId", "No category with id: " + categoryId);
        return new ErrorResource("Category not found", errors);
    }
}
