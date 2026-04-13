package com.ou.LMS_Spring.modules.assessments.repositories;

import com.ou.LMS_Spring.Entities.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {}