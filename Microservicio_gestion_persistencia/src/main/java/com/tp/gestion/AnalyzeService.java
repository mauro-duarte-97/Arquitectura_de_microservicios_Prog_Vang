package com.tp.gestion;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AnalyzeService {

    private final RestTemplate restTemplate;
    private final String pythonServiceBaseUrl;
    private final AnalysisHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    public AnalyzeService(RestTemplate restTemplate,
                          @Value("${python.service.base-url:http://localhost:5000}") String pythonServiceBaseUrl,
                          AnalysisHistoryRepository historyRepository,
                          ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.pythonServiceBaseUrl = pythonServiceBaseUrl;
        this.historyRepository = historyRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AnalyzeResponse analyze(User user, AnalyzeRequest request) {
        if (request == null || request.getCode() == null || request.getCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El campo code es obligatorio");
        }

        if (request.getLanguage() == null) {
            request.setLanguage("python");
        }
        if (request.getMode() == null) {
            request.setMode("Senior Dev");
        }

        AnalyzeResponse response = callPythonAnalyzer(request);
        UUID historyId = persistHistory(user, request, response);
        response.setHistoryId(historyId);
        return response;
    }

    private UUID persistHistory(User user, AnalyzeRequest request, AnalyzeResponse response) {
        String responseJson;
        try {
            responseJson = objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException ex) {
            // Si fallara la serializaci\u00f3n no queremos romper la respuesta al usuario;
            // dejamos null y registramos por logs (omitidos para mantener el c\u00f3digo simple).
            responseJson = null;
        }

        UUID id = UUID.randomUUID();
        AnalysisHistory entry = new AnalysisHistory(
                id,
                user,
                request.getLanguage(),
                request.getMode(),
                request.getCode(),
                responseJson,
                LocalDateTime.now()
        );
        historyRepository.save(entry);
        return id;
    }

    private AnalyzeResponse callPythonAnalyzer(AnalyzeRequest request) {
        String url = pythonServiceBaseUrl + "/analyze";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<AnalyzeRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<AnalyzeResponse> responseEntity = restTemplate.postForEntity(url, entity, AnalyzeResponse.class);
            return responseEntity.getBody();
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo conectar con el microservicio Python: " + ex.getMessage());
        }
    }
}
