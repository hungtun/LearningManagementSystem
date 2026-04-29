package com.ou.LMS_Spring.modules.assessments.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.AssessmentQuizSubmissionAnswer;

@Repository
public interface AssessmentQuizSubmissionAnswerRepository extends JpaRepository<AssessmentQuizSubmissionAnswer, Long> {
}
