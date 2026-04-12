package com.ou.LMS_Spring.helpers;

import org.springframework.http.HttpStatus;

import com.ou.LMS_Spring.resources.ErrorResource;

import lombok.Getter;

@Getter
public class ApiBusinessException extends RuntimeException {

    private final HttpStatus status;
    private final ErrorResource errorResource;

    public ApiBusinessException(HttpStatus status, ErrorResource errorResource) {
        super(errorResource != null ? errorResource.getMessage() : status.getReasonPhrase());
        this.status = status;
        this.errorResource = errorResource;
    }
}