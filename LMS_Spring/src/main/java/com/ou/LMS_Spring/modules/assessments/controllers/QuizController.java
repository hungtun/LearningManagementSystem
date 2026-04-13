package com.ou.LMS_Spring.modules.assessments.controllers;

import com.ou.LMS_Spring.Entities.Question;
import com.ou.LMS_Spring.Entities.Quiz;
import com.ou.LMS_Spring.modules.assessments.dtos.CreateQuestionRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.CreateQuizRequest;
import com.ou.LMS_Spring.modules.assessments.dtos.SubmitQuizRequest;
import com.ou.LMS_Spring.modules.assessments.services.QuizService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @Autowired
    private QuizService quizService;

    // CREATE QUIZ
    @PostMapping
    public Quiz createQuiz(@RequestBody CreateQuizRequest req) {
        return quizService.createQuiz(req);
    }

    // ADD QUESTION
    @PostMapping("/{quizId}/questions")
    public Question addQuestion(@PathVariable Long quizId,
                                @RequestBody CreateQuestionRequest req) {
        return quizService.addQuestion(quizId, req);
    }

    // SUBMIT QUIZ (FIX NULL SAFETY)
    @PostMapping("/{quizId}/submit")
    public float submitQuiz(@PathVariable Long quizId,
                            @RequestBody SubmitQuizRequest req) {

        if (req == null || req.getAnswers() == null) {
            throw new RuntimeException("Answers cannot be null");
        }

        Long userId = 1L; // TODO: JWT later

        return quizService.submitQuiz(quizId, userId, req);
    }
}