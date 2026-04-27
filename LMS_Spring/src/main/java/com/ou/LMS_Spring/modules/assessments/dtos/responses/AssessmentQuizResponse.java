package com.ou.LMS_Spring.modules.assessments.dtos.responses;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentQuizResponse {
    private Long quizId;
    private Long lessonId;
    private String title;
    private String description;
    private Integer passScore;
    private List<QuizQuestionResponse> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizQuestionResponse {
        private Long questionId;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
    }
}
