package com.ou.LMS_Spring.modules.assessments.dtos.requests;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AssignmentCreateRequest {

    @NotNull(message = "Lesson ID is required")
    private Long lessonId;

    @NotBlank(message = "Title is required")
    @Size(max = 500)
    private String title;

    @Size(max = 5000)
    private String description;

    // Optional deadline
    private LocalDateTime deadline;
}
