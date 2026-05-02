package com.ou.LMS_Spring.modules.learnings.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.LessonProgress;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByUser_IdAndLesson_Id(Long userId, Long lessonId);

    List<LessonProgress> findByUser_IdAndLesson_Course_Id(Long userId, Long courseId);

    long deleteByLesson_Id(Long lessonId);
}
