package com.ou.LMS_Spring.modules.learnings.dtos;

import org.springframework.http.MediaType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificateDownload {
    private byte[] body;
    private String filename;
    private MediaType mediaType;
}
