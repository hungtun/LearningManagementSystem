package com.ou.LMS_Spring.modules.courses.dtos.responses;

import java.util.List;

import com.ou.LMS_Spring.Entities.Lesson;

public class LessonDetailResponse {

    private Long id;
    private Long courseId;
    private String title;
    private String content;
    private int orderIndex;
    private String videoUrl;
    private List<LessonAttachmentResponse> attachments;

    public static LessonDetailResponse from(Lesson lesson) {
        LessonDetailResponse r = new LessonDetailResponse();
        r.setId(lesson.getId());
        r.setCourseId(lesson.getCourse().getId());
        r.setTitle(lesson.getTitle());
        r.setContent(lesson.getContent());
        r.setOrderIndex(lesson.getOrderIndex());
        r.setVideoUrl(lesson.getVideoUrl());
        return r;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public List<LessonAttachmentResponse> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<LessonAttachmentResponse> attachments) {
        this.attachments = attachments;
    }
}
