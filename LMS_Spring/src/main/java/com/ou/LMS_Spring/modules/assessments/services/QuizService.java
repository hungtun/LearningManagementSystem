package com.ou.LMS_Spring.modules.assessments.services;

import com.ou.LMS_Spring.Entities.*;
import com.ou.LMS_Spring.modules.assessments.dtos.*;
import com.ou.LMS_Spring.modules.assessments.repositories.*;
import com.ou.LMS_Spring.modules.courses.repositories.CourseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepo;

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private OptionRepository optionRepo;

    @Autowired
    private QuizAttemptRepository attemptRepo;

    @Autowired
    private CourseRepository courseRepo;

    // CREATE QUIZ
    public Quiz createQuiz(CreateQuizRequest req) {

        Course course = courseRepo.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Quiz quiz = new Quiz();
        quiz.setTitle(req.getTitle());
        quiz.setDescription(req.getDescription());
        quiz.setCourse(course);

        return quizRepo.save(quiz);
    }

    // ADD QUESTION
    public Question addQuestion(Long quizId, CreateQuestionRequest req) {

        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Question question = new Question();
        question.setContent(req.getContent());
        question.setQuiz(quiz);

        Question savedQuestion = questionRepo.save(question);

        for (OptionDTO o : req.getOptions()) {
            Option option = new Option();
            option.setContent(o.getContent());
            option.setCorrect(o.isCorrect());
            option.setQuestion(savedQuestion);

            optionRepo.save(option);
        }

        return savedQuestion;
    }

    // SUBMIT QUIZ (FIX FULL)
    public float submitQuiz(Long quizId, Long userId, SubmitQuizRequest req) {

        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (req.getAnswers() == null || req.getAnswers().isEmpty()) {
            return 0;
        }

        int correct = 0;

        for (AnswerDTO ans : req.getAnswers()) {

            if (ans.getOptionId() == null || ans.getQuestionId() == null) {
                throw new RuntimeException("Invalid answer data");
            }

            Option option = optionRepo.findById(ans.getOptionId())
                    .orElseThrow(() -> new RuntimeException("Option not found"));

            if (option.isCorrect()) {
                correct++;
            }
        }

        float score = ((float) correct / req.getAnswers().size()) * 10;

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setUserId(userId);
        attempt.setScore(score);

        attemptRepo.save(attempt);

        return score;
    }

    // GET BY COURSE
    public List<Quiz> getQuizByCourse(Long courseId) {
        return quizRepo.findByCourse_Id(courseId);
    }
}