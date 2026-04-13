package com.ou.LMS_Spring.Entities;

import jakarta.persistence.*;

@Entity
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @ManyToOne
    private Quiz quiz;

    private float score;

    public void setUserId(Long userId) { this.userId = userId; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
    public void setScore(float score) { this.score = score; }
}