package com.ou.LMS_Spring.modules.assessments.repositories;

import com.ou.LMS_Spring.Entities.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {}