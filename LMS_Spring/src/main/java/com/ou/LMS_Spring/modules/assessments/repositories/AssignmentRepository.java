package com.ou.LMS_Spring.modules.assessments.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.Assignment;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    Optional<Assignment> findByLesson_IdAndIsActiveTrue(Long lessonId);

    List<Assignment> findByLesson_Course_Instructor_IdAndIsActiveTrueOrderByCreatedAtDesc(Long instructorId);
}
