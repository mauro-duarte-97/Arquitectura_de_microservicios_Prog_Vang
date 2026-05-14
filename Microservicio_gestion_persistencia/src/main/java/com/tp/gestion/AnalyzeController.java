package com.tp.gestion;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    public AnalyzeResponse analyze(@AuthenticationPrincipal User user,
                                   @Valid @RequestBody AnalyzeRequest request) {
        return analyzeService.analyze(user, request);
    }

    @GetMapping("/analyze")
    public Map<String, Object> analyzeGetNotAllowed() {
        Map<String, Object> info = new HashMap<>();
        info.put("error", "M\u00e9todo no soportado");
        info.put("message", "El endpoint /analyze solo acepta peticiones POST");
        info.put("hint", "Aut\u00e9nticate primero en /api/v1/auth/login y env\u00eda Authorization: Bearer <token>");
        info.put("example_url", "POST http://localhost:8080/api/v1/analyze");
        Map<String, String> exampleBody = new HashMap<>();
        exampleBody.put("code", "print('hello')");
        exampleBody.put("language", "python");
        info.put("example_body", exampleBody);
        return info;
    }
}
