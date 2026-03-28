package com.ou.LMS_Spring.resources;

import java.util.Map;

import lombok.Data;

@Data
public class ErrorResource {
    private String message;
    private Map<String, String> errors;

    public ErrorResource(String message, Map<String, String> errors) {
        this.message = message;
        this.errors = errors;
    }
}
