package com.ou.LMS_Spring.modules.assessments.dtos.requests;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InstructorAssignmentUpdateRequest {

    @NotBlank
    @Size(max = 500)
    private String title;

    @Size(max = 5000)
    private String description;

    @Min(1)
    private int maxScore = 100;

    @NotNull
    private LocalDateTime startAt;

    @NotNull
    private LocalDateTime endAt;
}
