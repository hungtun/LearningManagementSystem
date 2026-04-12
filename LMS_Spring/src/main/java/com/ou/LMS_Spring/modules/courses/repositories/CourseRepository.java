package com.ou.LMS_Spring.modules.courses.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

}
