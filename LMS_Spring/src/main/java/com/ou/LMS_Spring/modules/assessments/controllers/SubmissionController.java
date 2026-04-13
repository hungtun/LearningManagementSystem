package com.ou.LMS_Spring.modules.assessments.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.ou.LMS_Spring.Entities.Submission;
import com.ou.LMS_Spring.modules.assessments.services.SubmissionService;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired private SubmissionService service;

    @PostMapping
    public Submission submit(@RequestParam Long assignmentId, @RequestParam String fileUrl) {
        return service.submit(assignmentId, 1L, fileUrl);
    }
}