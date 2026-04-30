package com.ou.LMS_Spring.modules.assessments.dtos.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuizUpdateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title is too long")
    private String title;

    @Size(max = 5000, message = "Description is too long")
    private String description;

    @NotNull(message = "Pass score is required")
    @Min(value = 0, message = "Pass score must be >= 0")
    private Integer passScore;
}
