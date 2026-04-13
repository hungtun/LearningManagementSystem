package com.ou.LMS_Spring.modules.assessments.controllers;

import com.ou.LMS_Spring.Entities.Quiz;
import com.ou.LMS_Spring.modules.assessments.services.QuizService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseQuizController {

    @Autowired
    private QuizService quizService;

    // GET QUIZ BY COURSE (TASK REQUIREMENT)
    @GetMapping("/{courseId}/quiz")
    public List<Quiz> getQuizByCourse(@PathVariable Long courseId) {
        return quizService.getQuizByCourse(courseId);
    }
}