package com.ou.LMS_Spring.modules.assessments.dtos.responses;



import java.time.LocalDateTime;

import java.util.List;



import com.ou.LMS_Spring.Entities.AssessmentQuestionOption;



import lombok.AllArgsConstructor;

import lombok.Data;

import lombok.NoArgsConstructor;



@Data

@NoArgsConstructor

@AllArgsConstructor

public class InstructorQuizResponse {

    private Long quizId;

    private Long lessonId;

    private String title;

    private String description;

    private Integer passScore;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private int maxAttempts;

    private List<QuizQuestionDetail> questions;



    @Data

    @NoArgsConstructor

    @AllArgsConstructor

    public static class QuizQuestionDetail {

        private Long questionId;

        private String questionText;

        private String optionA;

        private String optionB;

        private String optionC;

        private String optionD;

        private AssessmentQuestionOption correctOption;

        private int point;

        private int orderIndex;

    }

}

