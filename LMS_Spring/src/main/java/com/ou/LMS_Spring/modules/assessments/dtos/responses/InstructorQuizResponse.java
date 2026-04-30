package com.ou.LMS_Spring.modules.assessments.dtos.responses;

import java.util.List;

import com.ou.LMS_Spring.Entities.AssessmentQuiz;
import com.ou.LMS_Spring.Entities.AssessmentQuizQuestion;

public class InstructorQuizResponse {

    private Long id;
    private Long lessonId;
    private String title;
    private String description;
    private Integer passScore;
    private List<InstructorQuizQuestionResponse> questions;

    public static InstructorQuizResponse from(AssessmentQuiz quiz, List<AssessmentQuizQuestion> questions) {
        InstructorQuizResponse r = new InstructorQuizResponse();
        r.setId(quiz.getId());
        r.setLessonId(quiz.getLesson().getId());
        r.setTitle(quiz.getTitle());
        r.setDescription(quiz.getDescription());
        r.setPassScore(quiz.getPassScore());
        r.setQuestions(questions.stream().map(InstructorQuizQuestionResponse::from).toList());
        return r;
    }

    // Getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPassScore() { return passScore; }
    public void setPassScore(Integer passScore) { this.passScore = passScore; }

    public List<InstructorQuizQuestionResponse> getQuestions() { return questions; }
    public void setQuestions(List<InstructorQuizQuestionResponse> questions) { this.questions = questions; }

    // Inner class - includes correctOption (not exposed to students)
    public static class InstructorQuizQuestionResponse {

        private Long id;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctOption;
        private int point;
        private int orderIndex;

        public static InstructorQuizQuestionResponse from(AssessmentQuizQuestion q) {
            InstructorQuizQuestionResponse r = new InstructorQuizQuestionResponse();
            r.setId(q.getId());
            r.setQuestionText(q.getQuestionText());
            r.setOptionA(q.getOptionA());
            r.setOptionB(q.getOptionB());
            r.setOptionC(q.getOptionC());
            r.setOptionD(q.getOptionD());
            r.setCorrectOption(q.getCorrectOption() != null ? q.getCorrectOption().name() : null);
            r.setPoint(q.getPoint());
            r.setOrderIndex(q.getOrderIndex());
            return r;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }

        public String getOptionA() { return optionA; }
        public void setOptionA(String optionA) { this.optionA = optionA; }

        public String getOptionB() { return optionB; }
        public void setOptionB(String optionB) { this.optionB = optionB; }

        public String getOptionC() { return optionC; }
        public void setOptionC(String optionC) { this.optionC = optionC; }

        public String getOptionD() { return optionD; }
        public void setOptionD(String optionD) { this.optionD = optionD; }

        public String getCorrectOption() { return correctOption; }
        public void setCorrectOption(String correctOption) { this.correctOption = correctOption; }

        public int getPoint() { return point; }
        public void setPoint(int point) { this.point = point; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    }
}
