package com.ou.LMS_Spring.modules.assessments.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitResponse {
    private Long submissionId;
    private Integer score;
    private Integer maxScore;
    private boolean passed;
}
