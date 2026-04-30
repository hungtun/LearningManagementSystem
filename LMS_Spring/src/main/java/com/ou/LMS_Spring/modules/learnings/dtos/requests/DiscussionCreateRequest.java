package com.ou.LMS_Spring.modules.learnings.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DiscussionCreateRequest {

    @NotNull
    private Long lessonId;

    private Long parentId;

    @NotBlank
    private String content;
}
