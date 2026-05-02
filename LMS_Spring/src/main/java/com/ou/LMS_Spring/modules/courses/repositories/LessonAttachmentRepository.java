package com.ou.LMS_Spring.modules.courses.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.LessonAttachment;

@Repository
public interface LessonAttachmentRepository extends JpaRepository<LessonAttachment, Long> {

    List<LessonAttachment> findByLesson_IdOrderByCreatedAtAsc(Long lessonId);

    long deleteByLesson_Id(Long lessonId);
}
