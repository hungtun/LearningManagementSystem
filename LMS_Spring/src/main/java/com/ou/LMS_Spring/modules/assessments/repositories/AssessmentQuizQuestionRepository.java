package com.ou.LMS_Spring.modules.assessments.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.AssessmentQuizQuestion;

@Repository
public interface AssessmentQuizQuestionRepository extends JpaRepository<AssessmentQuizQuestion, Long> {
    List<AssessmentQuizQuestion> findByQuiz_IdOrderByOrderIndexAsc(Long quizId);
}
