package com.tp.gestion;

public class IssueDto {

    private int line;
    private String message;
    private String severity;

    public IssueDto() {
    }

    public IssueDto(int line, String message, String severity) {
        this.line = line;
        this.message = message;
        this.severity = severity;
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
}
