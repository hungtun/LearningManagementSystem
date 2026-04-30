package com.ou.LMS_Spring.modules.courses.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LessonUpdateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title is too long")
    private String title;

    @Size(max = 50000, message = "Content is too long")
    private String content;

    @Size(max = 2048, message = "Video URL is too long")
    private String videoUrl;

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
}
