package com.ou.LMS_Spring.modules.assessments.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.ou.LMS_Spring.Entities.Assignment;
import com.ou.LMS_Spring.Entities.Course;
import com.ou.LMS_Spring.modules.assessments.repositories.AssignmentRepository;
import com.ou.LMS_Spring.modules.assessments.services.AssignmentService;
import com.ou.LMS_Spring.modules.courses.repositories.CourseRepository;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepo;

    @Autowired
    private CourseRepository courseRepo;

    @Override
    public Assignment createAssignment(Long courseId, Assignment assignment) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        assignment.setCourse(course);

        return assignmentRepo.save(assignment);
    }

    @Override
    public List<Assignment> getAssignmentsByCourse(Long courseId) {
        return assignmentRepo.findByCourseId(courseId);
    }

    @Override
    public List<Assignment> getAllAssignments() {
        return assignmentRepo.findAll();
    }

    @Override
    public void deleteAssignment(Long id) {
        assignmentRepo.deleteById(id);
    }
}