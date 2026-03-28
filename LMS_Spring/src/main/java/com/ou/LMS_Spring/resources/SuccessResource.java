package com.ou.LMS_Spring.resources;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SuccessResource<T> {
    private String message;
    private T data;
}
