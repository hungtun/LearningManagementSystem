package com.ou.LMS_Spring.modules.courses.dtos.responses;

import java.util.ArrayList;
import java.util.List;

import com.ou.LMS_Spring.Entities.Lesson;

public class LessonDetailResponse {

    private Long id;
    private Long courseId;
    private String title;
    private String content;
    private String videoUrl;
    private int orderIndex;
    private List<LessonAttachmentResponse> attachments = new ArrayList<>();

    public static LessonDetailResponse from(Lesson lesson) {
        return from(lesson, new ArrayList<>());
    }

    public static LessonDetailResponse from(Lesson lesson, List<LessonAttachmentResponse> attachments) {
        LessonDetailResponse r = new LessonDetailResponse();
        r.setId(lesson.getId());
        r.setCourseId(lesson.getCourse().getId());
        r.setTitle(lesson.getTitle());
        r.setContent(lesson.getContent());
        r.setVideoUrl(lesson.getVideoUrl());
        r.setOrderIndex(lesson.getOrderIndex());
        r.setAttachments(attachments != null ? attachments : new ArrayList<>());
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

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public List<LessonAttachmentResponse> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<LessonAttachmentResponse> attachments) {
        this.attachments = attachments;
    }
}
