package com.ou.LMS_Spring.Entities;

import jakarta.persistence.*;

@Entity
public class QuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private QuizAttempt attempt;

    @ManyToOne
    private Question question;

    @ManyToOne
    private Option selectedOption;

    public void setAttempt(QuizAttempt attempt) { this.attempt = attempt; }
    public void setQuestion(Question question) { this.question = question; }
    public void setSelectedOption(Option selectedOption) { this.selectedOption = selectedOption; }
}