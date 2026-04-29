package com.ou.LMS_Spring.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "assessment_quiz_questions")
public class AssessmentQuizQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private AssessmentQuiz quiz;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String optionA;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String optionB;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String optionC;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String optionD;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AssessmentQuestionOption correctOption;

    @Column(nullable = false)
    private int point = 1;

    @Column(nullable = false)
    private int orderIndex = 0;

    public AssessmentQuiz getQuiz() {
        return quiz;
    }

    public void setQuiz(AssessmentQuiz quiz) {
        this.quiz = quiz;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public AssessmentQuestionOption getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(AssessmentQuestionOption correctOption) {
        this.correctOption = correctOption;
    }

    public int getPoint() {
        return point;
    }

    public void setPoint(int point) {
        this.point = point;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }
}
