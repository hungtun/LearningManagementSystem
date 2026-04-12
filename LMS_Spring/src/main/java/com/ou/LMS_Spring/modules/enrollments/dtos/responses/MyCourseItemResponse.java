package com.ou.LMS_Spring.modules.enrollments.dtos.responses;

import java.time.LocalDateTime;

import com.ou.LMS_Spring.Entities.EnrollmentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyCourseItemResponse {
    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private EnrollmentStatus status;
    private LocalDateTime enrolledAt;
}
