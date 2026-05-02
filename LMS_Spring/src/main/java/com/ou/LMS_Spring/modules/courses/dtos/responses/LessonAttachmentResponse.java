package com.ou.LMS_Spring.modules.courses.dtos.responses;

import com.ou.LMS_Spring.Entities.LessonAttachment;

public class LessonAttachmentResponse {

    private Long id;
    private Long lessonId;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;

    public static LessonAttachmentResponse from(LessonAttachment a) {
        LessonAttachmentResponse r = new LessonAttachmentResponse();
        r.setId(a.getId());
        r.setLessonId(a.getLesson().getId());
        r.setFileName(a.getFileName());
        r.setFileUrl(a.getFileUrl());
        r.setFileType(a.getFileType());
        r.setFileSize(a.getFileSize());
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
}
