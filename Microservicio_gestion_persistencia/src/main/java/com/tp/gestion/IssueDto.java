package com.tp.gestion;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class IssueDto {

    private int line;
    private String message;
    private String severity;

    // Etiqueta corta del issue ("INYECCION SQL", "FALTA DE DOS PUNTOS", etc.)
    // que el frontend usa como titulo del card. Es opcional: si el microservicio
    // Python no la entrega, el frontend deriva un titulo desde el mensaje.
    private String title;

    public IssueDto() {
    }

    public IssueDto(int line, String message, String severity) {
        this.line = line;
        this.message = message;
        this.severity = severity;
    }

    public IssueDto(int line, String message, String severity, String title) {
        this.line = line;
        this.message = message;
        this.severity = severity;
        this.title = title;
    }

    public int getLine() {
        return line;
    }

    public void setLine(int line) {
        this.line = line;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
