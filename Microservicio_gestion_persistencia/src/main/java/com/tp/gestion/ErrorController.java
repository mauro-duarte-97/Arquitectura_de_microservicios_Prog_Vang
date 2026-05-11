package com.tp.gestion;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ErrorController {

    private final RestTemplate restTemplate;
    private final String pythonServiceBaseUrl;

    public ErrorController(RestTemplate restTemplate,
                           @Value("${python.service.base-url:http://localhost:5000}") String pythonServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.pythonServiceBaseUrl = pythonServiceBaseUrl;
    }

    @GetMapping("/error")
    public ResponseEntity<Map<String, Object>> error() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Endpoint /error - No autorizado");
        response.put("code", HttpStatus.UNAUTHORIZED.value());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Java microservice is running");
        response.put("port", 8080);
        
        try {
            String pythonHealthUrl = pythonServiceBaseUrl + "/test";
            restTemplate.getForObject(pythonHealthUrl, Object.class);
            response.put("python_service", "connected");
            response.put("python_url", pythonServiceBaseUrl);
        } catch (Exception ex) {
            response.put("python_service", "disconnected");
            response.put("python_error", ex.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}
