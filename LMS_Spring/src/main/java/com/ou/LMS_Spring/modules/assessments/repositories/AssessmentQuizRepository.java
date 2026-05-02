package com.ou.LMS_Spring.modules.assessments.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.AssessmentQuiz;

@Repository
public interface AssessmentQuizRepository extends JpaRepository<AssessmentQuiz, Long> {
    Optional<AssessmentQuiz> findByIdAndIsActiveTrue(Long id);

    Optional<AssessmentQuiz> findByLesson_Id(Long lessonId);
}
