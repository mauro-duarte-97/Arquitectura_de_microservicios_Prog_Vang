package com.tp.gestion;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AnalyzeService {

    private final RestTemplate restTemplate;
    private final String pythonServiceBaseUrl;
    private final List<AnalyzeHistoryEntry> history = Collections.synchronizedList(new ArrayList<>());

    public AnalyzeService(RestTemplate restTemplate,
                          @Value("${python.service.base-url:http://localhost:8000}") String pythonServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.pythonServiceBaseUrl = pythonServiceBaseUrl;
    }

    public AnalyzeResponse analyze(String authorization, AnalyzeRequest request) {
        validateAuthorization(authorization);
        if (request == null || request.getCode() == null || request.getCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El campo code es obligatorio");
        }

        if (request.getLanguage() == null) {
            request.setLanguage("python");
        }
        if (request.getMode() == null) {
            request.setMode("Senior Dev");
        }

        AnalyzeHistoryEntry entry = new AnalyzeHistoryEntry(request);
        history.add(entry);

        AnalyzeResponse response = callPythonAnalyzer(request);
        entry.setResponse(response);

        return response;
    }

    public List<AnalyzeHistoryEntry> getHistory() {
        return new ArrayList<>(history);
    }

    private void validateAuthorization(String authorization) {
        // En desarrollo, permitir sin token. En producción, validar.
        if (authorization == null) {
            return; // Permitir en desarrollo
        }
        if (!authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization header invalid format");
        }
        String token = authorization.substring(7);
        if (!"valid-token".equals(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
        }
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
