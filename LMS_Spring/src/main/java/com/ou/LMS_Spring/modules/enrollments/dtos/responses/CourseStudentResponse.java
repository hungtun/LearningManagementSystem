package com.ou.LMS_Spring.modules.enrollments.dtos.responses;

import java.time.LocalDateTime;

import com.ou.LMS_Spring.Entities.EnrollmentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseStudentResponse {
    private Long userId;
    private String email;
    private String fullName;
    private EnrollmentStatus enrollmentStatus;
    private LocalDateTime enrolledAt;
}
