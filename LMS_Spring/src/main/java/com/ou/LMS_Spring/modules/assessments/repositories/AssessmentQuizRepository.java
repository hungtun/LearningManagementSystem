package com.ou.LMS_Spring.modules.assessments.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.AssessmentQuiz;

@Repository
public interface AssessmentQuizRepository extends JpaRepository<AssessmentQuiz, Long> {

    Optional<AssessmentQuiz> findByIdAndIsActiveTrue(Long id);

    Optional<AssessmentQuiz> findByLesson_IdAndIsActiveTrue(Long lessonId);

    List<AssessmentQuiz> findByLesson_Course_Instructor_IdAndIsActiveTrueOrderByCreatedAtDesc(Long instructorId);
}
