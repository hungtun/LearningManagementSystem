package com.ou.LMS_Spring.modules.assessments.dtos.requests;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InstructorGradeRequest {

    @NotBlank
    private String submissionType;

    @NotNull
    private Long submissionId;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer score;

    private String feedback;
}
