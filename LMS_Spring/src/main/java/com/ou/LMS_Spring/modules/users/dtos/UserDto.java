package com.ou.LMS_Spring.modules.users.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;


@Data
@Builder
@RequiredArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private final Long id;
    private final String email;
    private final String fullName;
    private final String avatarUrl;
}
