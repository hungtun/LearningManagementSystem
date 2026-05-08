package com.ou.LMS_Spring.Services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.ou.LMS_Spring.config.CloudinaryConfig;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final CloudinaryConfig cloudinaryConfig;

    public String uploadFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }

        validateCloudinaryConfig();

        long timestamp = Instant.now().getEpochSecond();
        String baseFolder = cloudinaryConfig.getFolder();
        String folder = (baseFolder != null && !baseFolder.isBlank())
                ? baseFolder + "/" + subFolder
                : subFolder;

        Map<String, String> signParams = new HashMap<>();
        signParams.put("timestamp", String.valueOf(timestamp));
        signParams.put("folder", folder);

        String signature = createSignature(signParams, cloudinaryConfig.getApiSecret());
        String endpoint = String.format("https://api.cloudinary.com/v1_1/%s/raw/upload", cloudinaryConfig.getCloudName());

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("api_key", cloudinaryConfig.getApiKey());
        body.add("timestamp", String.valueOf(timestamp));
        body.add("signature", signature);
        body.add("folder", folder);
        body.add("file", toResource(file));

        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, createMultipartHeaders());

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(endpoint, request, Map.class);
        if (response == null || response.get("secure_url") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cloudinary upload failed");
        }

        return response.get("secure_url").toString();
    }

    public String uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar file is required");
        }

        validateCloudinaryConfig();

        long timestamp = Instant.now().getEpochSecond();
        String folder = cloudinaryConfig.getFolder();

        Map<String, String> signParams = new HashMap<>();
        signParams.put("timestamp", String.valueOf(timestamp));
        if (folder != null && !folder.isBlank()) {
            signParams.put("folder", folder);
        }

        String signature = createSignature(signParams, cloudinaryConfig.getApiSecret());
        String endpoint = String.format("https://api.cloudinary.com/v1_1/%s/image/upload", cloudinaryConfig.getCloudName());

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("api_key", cloudinaryConfig.getApiKey());
        body.add("timestamp", String.valueOf(timestamp));
        body.add("signature", signature);
        if (folder != null && !folder.isBlank()) {
            body.add("folder", folder);
        }
        body.add("file", toResource(file));

        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, createMultipartHeaders());

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(endpoint, request, Map.class);
        if (response == null || response.get("secure_url") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cloudinary upload failed");
        }

        return response.get("secure_url").toString();
    }

    private ByteArrayResource toResource(MultipartFile file) {
        try {
            return new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot read uploaded file");
        }
    }

    private org.springframework.http.HttpHeaders createMultipartHeaders() {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        return headers;
    }

    private void validateCloudinaryConfig() {
        if (isBlank(cloudinaryConfig.getCloudName()) || isBlank(cloudinaryConfig.getApiKey()) || isBlank(cloudinaryConfig.getApiSecret())) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary env is not configured");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String createSignature(Map<String, String> params, String apiSecret) {
        StringBuilder toSign = new StringBuilder();
        params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    if (toSign.length() > 0) {
                        toSign.append("&");
                    }
                    toSign.append(entry.getKey()).append("=").append(entry.getValue());
                });
        toSign.append(apiSecret);

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(toSign.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot create Cloudinary signature");
        }
    }
}
