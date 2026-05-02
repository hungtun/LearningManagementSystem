package com.ou.LMS_Spring.modules.assessments.repositories;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.AssessmentQuizSubmissionAnswer;

@Repository
public interface AssessmentQuizSubmissionAnswerRepository extends JpaRepository<AssessmentQuizSubmissionAnswer, Long> {
    List<AssessmentQuizSubmissionAnswer> findBySubmission_Id(Long submissionId);

    long deleteBySubmission_IdIn(Collection<Long> submissionIds);

    long deleteByQuestion_Quiz_Id(Long quizId);
}
