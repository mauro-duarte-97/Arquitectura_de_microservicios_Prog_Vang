package com.tp.gestion;

import java.time.LocalDateTime;
import java.util.UUID;

public class AnalyzeHistoryEntry {

    private final UUID id;
    private final AnalyzeRequest request;
    private final LocalDateTime createdAt;
    private AnalyzeResponse response;

    public AnalyzeHistoryEntry(AnalyzeRequest request) {
        this.id = UUID.randomUUID();
        this.request = request;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public AnalyzeRequest getRequest() {
        return request;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public AnalyzeResponse getResponse() {
        return response;
    }

    public void setResponse(AnalyzeResponse response) {
        this.response = response;
    }
}
