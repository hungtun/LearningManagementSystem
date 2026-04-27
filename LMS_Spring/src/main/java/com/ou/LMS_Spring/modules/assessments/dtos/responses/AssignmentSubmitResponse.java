package com.ou.LMS_Spring.modules.assessments.dtos.responses;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmitResponse {
    private Long submissionId;
    private Long lessonId;
    private String originalFilename;
    private LocalDateTime submittedAt;
}
