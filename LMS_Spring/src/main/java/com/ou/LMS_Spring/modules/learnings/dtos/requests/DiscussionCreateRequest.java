package com.ou.LMS_Spring.modules.learnings.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DiscussionCreateRequest {

    @NotNull
    private Long lessonId;

    @NotBlank
    private String content;

    private Long parentId;
}
