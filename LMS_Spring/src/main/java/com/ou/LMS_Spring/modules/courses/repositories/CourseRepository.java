package com.ou.LMS_Spring.modules.courses.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.Course;
import com.ou.LMS_Spring.Entities.CoursePublicationStatus;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByPublicationStatusOrderByTitleAsc(CoursePublicationStatus publicationStatus);

    List<Course> findByPublicationStatusOrderByUpdatedAtDesc(CoursePublicationStatus publicationStatus);

    List<Course> findByInstructor_IdOrderByUpdatedAtDesc(Long instructorId);

    long countByInstructor_Id(Long instructorId);

    long countByInstructor_IdAndPublicationStatus(Long instructorId, CoursePublicationStatus publicationStatus);

    long countByPublicationStatus(CoursePublicationStatus publicationStatus);
}
