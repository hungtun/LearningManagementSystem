package com.ou.LMS_Spring.modules.assessments.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.ou.LMS_Spring.Entities.Assignment;
import com.ou.LMS_Spring.modules.assessments.services.AssignmentService;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    // ✅ CREATE
    @PostMapping
    public Assignment createAssignment(
            @RequestParam Long courseId,
            @RequestBody Assignment assignment
    ) {
        return assignmentService.createAssignment(courseId, assignment);
    }

    // ✅ GET theo course
    @GetMapping("/course/{courseId}")
    public List<Assignment> getByCourse(@PathVariable Long courseId) {
        return assignmentService.getAssignmentsByCourse(courseId);
    }

    // ✅ GET all
    @GetMapping
    public List<Assignment> getAll() {
        return assignmentService.getAllAssignments();
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return "Deleted assignment with id = " + id;
    }
}