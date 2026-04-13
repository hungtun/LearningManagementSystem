package com.ou.LMS_Spring.modules.assessments.services;

import com.ou.LMS_Spring.Entities.*;
import com.ou.LMS_Spring.modules.assessments.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SubmissionService {

    @Autowired private SubmissionRepository submissionRepo;
    @Autowired private AssignmentRepository assignmentRepo;

    public Submission submit(Long assignmentId, Long userId, String fileUrl) {
        Assignment a = assignmentRepo.findById(assignmentId).orElseThrow();

        Submission s = new Submission();
        s.setAssignment(a);
        s.setUserId(userId);
        s.setFileUrl(fileUrl);

        return submissionRepo.save(s);
    }
}