package com.ou.LMS_Spring.modules.assessments.dtos.requests;

import java.util.List;

import com.ou.LMS_Spring.Entities.AssessmentQuestionOption;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizSubmitRequest {

    @NotNull
    private Long quizId;

    @Valid
    @NotEmpty
    private List<QuizAnswerRequest> answers;

    @Data
    public static class QuizAnswerRequest {
        @NotNull
        private Long questionId;

        @NotNull
        private AssessmentQuestionOption selectedOption;
    }
}
