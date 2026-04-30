package com.ou.LMS_Spring.modules.assessments.dtos.requests;

import com.ou.LMS_Spring.Entities.AssessmentQuestionOption;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuizQuestionUpsertRequest {

    @NotBlank(message = "Question text is required")
    @Size(max = 2000)
    private String questionText;

    @NotBlank(message = "Option A is required")
    @Size(max = 1000)
    private String optionA;

    @NotBlank(message = "Option B is required")
    @Size(max = 1000)
    private String optionB;

    @NotBlank(message = "Option C is required")
    @Size(max = 1000)
    private String optionC;

    @NotBlank(message = "Option D is required")
    @Size(max = 1000)
    private String optionD;

    @NotNull(message = "Correct option is required (A, B, C, or D)")
    private AssessmentQuestionOption correctOption;

    @Min(1) @Max(10)
    private int point = 1;
}
