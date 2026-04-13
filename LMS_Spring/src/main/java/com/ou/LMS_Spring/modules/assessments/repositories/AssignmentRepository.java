package com.ou.LMS_Spring.modules.assessments.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ou.LMS_Spring.Entities.Assignment;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByCourseId(Long courseId);

}