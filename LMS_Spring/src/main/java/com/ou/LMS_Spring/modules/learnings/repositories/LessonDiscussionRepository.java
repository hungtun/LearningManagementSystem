package com.ou.LMS_Spring.modules.learnings.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ou.LMS_Spring.Entities.LessonDiscussion;

@Repository
public interface LessonDiscussionRepository extends JpaRepository<LessonDiscussion, Long> {

    List<LessonDiscussion> findByLesson_IdOrderByCreatedAtAsc(Long lessonId);

    List<LessonDiscussion> findByLesson_IdAndParentIsNullOrderByCreatedAtAsc(Long lessonId);

    List<LessonDiscussion> findByParent_IdOrderByCreatedAtAsc(Long parentId);
}
