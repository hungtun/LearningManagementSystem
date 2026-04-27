package com.ou.LMS_Spring.modules.system.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BroadcastNotificationRequest {

    @NotBlank(message = "Notification title is required")
    @Size(max = 200, message = "Notification title must be at most 200 characters")
    private String title;

    @NotBlank(message = "Notification content is required")
    @Size(max = 3000, message = "Notification content must be at most 3000 characters")
    private String content;

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
}
