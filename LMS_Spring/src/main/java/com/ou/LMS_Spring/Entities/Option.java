package com.ou.LMS_Spring.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "options")
public class Option {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Question question;

    private String content;

    private boolean isCorrect;

    public Long getId() { return id; }

    public boolean isCorrect() { return isCorrect; }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }
}