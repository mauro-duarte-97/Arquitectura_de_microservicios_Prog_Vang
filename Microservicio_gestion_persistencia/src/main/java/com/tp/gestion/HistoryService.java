package com.tp.gestion;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class HistoryService {

    private final AnalysisHistoryRepository repository;
    private final ObjectMapper objectMapper;

    public HistoryService(AnalysisHistoryRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Page<AnalysisHistoryResponse> listMine(User user, Pageable pageable) {
        return repository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(entity -> AnalysisHistoryResponse.from(entity, objectMapper));
    }

    @Transactional(readOnly = true)
    public AnalysisHistoryResponse getMine(User user, UUID id) {
        AnalysisHistory entity = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "An\u00e1lisis no encontrado"));
        return AnalysisHistoryResponse.from(entity, objectMapper);
    }
}
