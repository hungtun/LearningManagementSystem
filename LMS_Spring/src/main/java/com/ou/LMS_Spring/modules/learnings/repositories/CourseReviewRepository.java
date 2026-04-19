package com.ou.LMS_Spring.modules.learnings.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.CourseReview;

@Repository
public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    boolean existsByUser_IdAndCourse_Id(Long userId, Long courseId);

    Optional<CourseReview> findByUser_IdAndCourse_Id(Long userId, Long courseId);
}
