package com.tp.gestion;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.UUID;

public class AnalysisHistoryResponse {

    private UUID id;
    private String language;
    private String mode;
    private String code;
    private AnalyzeResponse response;
    private LocalDateTime createdAt;

    public AnalysisHistoryResponse() {
    }

    public static AnalysisHistoryResponse from(AnalysisHistory entity, ObjectMapper objectMapper) {
        AnalysisHistoryResponse dto = new AnalysisHistoryResponse();
        dto.id = entity.getId();
        dto.language = entity.getLanguage();
        dto.mode = entity.getMode();
        dto.code = entity.getCode();
        dto.createdAt = entity.getCreatedAt();
        if (entity.getResponseJson() != null) {
            try {
                dto.response = objectMapper.readValue(entity.getResponseJson(), AnalyzeResponse.class);
            } catch (JsonProcessingException ex) {
                dto.response = null;
            }
        }
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public AnalyzeResponse getResponse() {
        return response;
    }

    public void setResponse(AnalyzeResponse response) {
        this.response = response;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
