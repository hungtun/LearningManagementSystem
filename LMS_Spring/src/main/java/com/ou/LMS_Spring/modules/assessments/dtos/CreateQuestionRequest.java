package com.ou.LMS_Spring.modules.assessments.dtos;

import java.util.List;

public class CreateQuestionRequest {

    private String content;
    private List<OptionDTO> options;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<OptionDTO> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDTO> options) {
        this.options = options;
    }
}