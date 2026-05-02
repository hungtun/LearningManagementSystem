package com.ou.LMS_Spring.modules.assessments.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorQuizAnswerItemResponse {

    private Long questionId;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String selectedOption;
    private String correctOption;
    private boolean correct;
    private int earnedPoint;
    private int questionPoint;
}
