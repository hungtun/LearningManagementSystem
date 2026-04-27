package com.ou.LMS_Spring.modules.assessments.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.AssessmentQuizSubmission;

@Repository
public interface AssessmentQuizSubmissionRepository extends JpaRepository<AssessmentQuizSubmission, Long> {
    List<AssessmentQuizSubmission> findByQuiz_Lesson_Course_Instructor_IdOrderBySubmittedAtDesc(Long instructorId);
}
