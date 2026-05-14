package com.tp.gestion;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnalyzeResponse {

    private List<IssueDto> issues;
    private String explanation;

    // El microservicio Python emite "refactored_code" (snake_case).
    // El alias permite a Jackson deserializarlo correctamente al campo
    // camelCase, y al serializar de vuelta al frontend lo expone como
    // "refactoredCode".
    @JsonAlias({"refactored_code"})
    private String refactoredCode;

    // ID del registro persistido en analysis_history. Lo seteamos después
    // de guardar para que el frontend pueda navegar al detalle real y
    // sobrevivir a un refresh de página.
    private UUID historyId;

    public AnalyzeResponse() {
    }

    public List<IssueDto> getIssues() {
        return issues;
    }

    public void setIssues(List<IssueDto> issues) {
        this.issues = issues;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getRefactoredCode() {
        return refactoredCode;
    }

    public void setRefactoredCode(String refactoredCode) {
        this.refactoredCode = refactoredCode;
    }

    public UUID getHistoryId() {
        return historyId;
    }

    public void setHistoryId(UUID historyId) {
        this.historyId = historyId;
    }
}
