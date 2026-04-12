package com.ou.LMS_Spring.modules.enrollments.dtos.requests;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollmentRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;
}
