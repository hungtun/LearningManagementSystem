package com.ou.LMS_Spring.modules.assessments.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ou.LMS_Spring.Entities.Quiz;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    
    List<Quiz> findByCourse_Id(Long courseId);
}