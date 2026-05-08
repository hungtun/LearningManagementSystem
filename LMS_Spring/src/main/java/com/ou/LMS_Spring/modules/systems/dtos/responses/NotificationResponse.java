package com.ou.LMS_Spring.modules.systems.dtos.responses;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String title;
    private String content;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationResponse(Long id, String title, String content, boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.read = read;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
