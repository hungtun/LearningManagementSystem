package com.ou.LMS_Spring.modules.assessments.dtos.requests;

import com.ou.LMS_Spring.Entities.AssessmentQuestionOption;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizQuestionRequest {

    @NotBlank
    private String questionText;

    @NotBlank
    private String optionA;

    @NotBlank
    private String optionB;

    @NotBlank
    private String optionC;

    @NotBlank
    private String optionD;

    @NotNull
    private AssessmentQuestionOption correctOption;

    @Min(1)
    private int point = 1;

    @Min(0)
    private int orderIndex = 0;
}
