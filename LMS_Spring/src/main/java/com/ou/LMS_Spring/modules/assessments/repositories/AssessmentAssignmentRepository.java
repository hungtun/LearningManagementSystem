package com.ou.LMS_Spring.modules.assessments.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.AssessmentAssignment;

@Repository
public interface AssessmentAssignmentRepository extends JpaRepository<AssessmentAssignment, Long> {

    Optional<AssessmentAssignment> findByLesson_Id(Long lessonId);
}
