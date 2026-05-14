package com.tp.gestion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AnalyzeRequest {

    @NotBlank(message = "El campo code es obligatorio")
    private String code;

    @Size(max = 50)
    private String language;

    @Size(max = 50)
    private String mode;

    public AnalyzeRequest() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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
}
