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
@Table(name = "assessment_quiz_submission_answers")
public class AssessmentQuizSubmissionAnswer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private AssessmentQuizSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private AssessmentQuizQuestion question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AssessmentQuestionOption selectedOption;

    @Column(nullable = false)
    private boolean correct;

    @Column(nullable = false)
    private int earnedPoint = 0;

    public AssessmentQuizSubmission getSubmission() {
        return submission;
    }

    public void setSubmission(AssessmentQuizSubmission submission) {
        this.submission = submission;
    }

    public AssessmentQuizQuestion getQuestion() {
        return question;
    }

    public void setQuestion(AssessmentQuizQuestion question) {
        this.question = question;
    }

    public AssessmentQuestionOption getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(AssessmentQuestionOption selectedOption) {
        this.selectedOption = selectedOption;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public int getEarnedPoint() {
        return earnedPoint;
    }

    public void setEarnedPoint(int earnedPoint) {
        this.earnedPoint = earnedPoint;
    }
}
