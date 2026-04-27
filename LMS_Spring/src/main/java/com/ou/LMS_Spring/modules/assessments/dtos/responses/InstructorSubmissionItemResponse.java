package com.ou.LMS_Spring.modules.assessments.dtos.responses;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorSubmissionItemResponse {
    private String submissionType;
    private Long submissionId;
    private Long courseId;
    private Long lessonId;
    private Long studentId;
    private String studentName;
    private Integer score;
    private Integer maxScore;
    private String feedback;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;
}
