package com.ou.LMS_Spring.helpers.exceptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.ou.LMS_Spring.helpers.ApiBusinessException;
import com.ou.LMS_Spring.resources.ErrorResource;

public class CategoryNameConflictException extends ApiBusinessException {

    private static final String CODE = "code";

    public CategoryNameConflictException(String categoryName) {
        super(HttpStatus.CONFLICT, buildError(categoryName));
    }

    private static ErrorResource buildError(String categoryName) {
        Map<String, String> errors = new HashMap<>();
        errors.put(CODE, "CATEGORY_NAME_CONFLICT");
        errors.put("name", "Category name already exists: " + categoryName);
        return new ErrorResource("Category name already exists", errors);
    }
}
