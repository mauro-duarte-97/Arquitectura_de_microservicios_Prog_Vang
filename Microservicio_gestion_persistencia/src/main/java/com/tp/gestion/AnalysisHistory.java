package com.tp.gestion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
<<<<<<< Updated upstream
=======
import jakarta.persistence.Version;
>>>>>>> Stashed changes

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "analysis_history")
public class AnalysisHistory {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "language", nullable = false, length = 50)
    private String language;

    @Column(name = "mode", nullable = false, length = 50)
    private String mode;

    @Column(name = "code", nullable = false, columnDefinition = "TEXT")
    private String code;

    // Respuesta del microservicio Python serializada a JSON.
    // Se guarda como TEXT para evitar dependencias del tipo JSONB de Postgres
    // y mantener portabilidad. La (de)serializaci\u00f3n se hace en el service.
    @Column(name = "response_json", columnDefinition = "TEXT")
    private String responseJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

<<<<<<< Updated upstream
=======
    // Lock optimista (concurrencia): Hibernate verifica que esta versi\u00f3n
    // coincida en cada UPDATE. Si dos transacciones tocan la misma fila en
    // paralelo, una abortar\u00e1 con OptimisticLockException.
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

>>>>>>> Stashed changes
    public AnalysisHistory() {
    }

    public AnalysisHistory(UUID id, User user, String language, String mode, String code,
                           String responseJson, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.language = language;
        this.mode = mode;
        this.code = code;
        this.responseJson = responseJson;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getResponseJson() {
        return responseJson;
    }

    public void setResponseJson(String responseJson) {
        this.responseJson = responseJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
<<<<<<< Updated upstream
=======

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
>>>>>>> Stashed changes
}
