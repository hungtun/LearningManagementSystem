package com.ou.LMS_Spring.modules.assessments.services;

import java.util.List;
import com.ou.LMS_Spring.Entities.Assignment;

public interface AssignmentService {

    Assignment createAssignment(Long courseId, Assignment assignment);

    List<Assignment> getAssignmentsByCourse(Long courseId);

    List<Assignment> getAllAssignments();

    void deleteAssignment(Long id);
}