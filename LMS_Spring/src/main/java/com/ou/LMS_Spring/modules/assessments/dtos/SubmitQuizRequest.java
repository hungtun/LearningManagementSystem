package com.ou.LMS_Spring.modules.assessments.dtos;

import java.util.List;

public class SubmitQuizRequest {

    private List<AnswerDTO> answers;

    public List<AnswerDTO> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerDTO> answers) {
        this.answers = answers;
    }
}