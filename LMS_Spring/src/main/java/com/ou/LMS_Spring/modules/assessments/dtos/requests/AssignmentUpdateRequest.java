package com.ou.LMS_Spring.modules.assessments.dtos.requests;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AssignmentUpdateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 500)
    private String title;

    @Size(max = 5000)
    private String description;

    private LocalDateTime deadline;
}
