package com.tp.gestion;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AnalyzeController {

    private final AnalyzeService analyzeService;

    public AnalyzeController(AnalyzeService analyzeService) {
        this.analyzeService = analyzeService;
    }

    @PostMapping("/analyze")
    @ResponseStatus(HttpStatus.OK)
    public AnalyzeResponse analyze(
            @RequestHeader(name = "Authorization", required = false) String authorization,
            @RequestBody AnalyzeRequest request) {
        return analyzeService.analyze(authorization, request);
    }

    @GetMapping("/analyze")
    public Map<String, Object> analyzeGetNotAllowed() {
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Método no soportado");
        error.put("message", "El endpoint /analyze solo acepta peticiones POST");
        error.put("hint", "Cambia el método a POST en Postman o en tu cliente HTTP");
        error.put("example_url", "POST http://localhost:8080/api/v1/analyze");
        error.put("example_body", new HashMap<String, String>() {{
            put("code", "print('hello')");
            put("language", "python");
        }});
        return error;
    }
}

