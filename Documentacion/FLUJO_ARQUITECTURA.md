# Flujo de Arquitectura - Análisis de Código

## 1️⃣ El Usuario y la UI (Frontend)

```
┌─────────────────┐
│  Interfaz UI    │
│  (React/Vue)    │
└────────┬────────┘
         │ 1. Usuario pega código + selecciona modo
         │ 2. GET Authorization (Header)
         │ 3. POST JSON al Java
         │
```

**Request ejemplo:**
```bash
POST http://localhost:8080/api/v1/analyze
Authorization: Bearer valid-token
Content-Type: application/json

{
  "code": "print('TODO: fix this')",
  "language": "python",
  "mode": "Senior Dev"
}
```

---

## 2️⃣ Microservicio Java (Orquestador)

**Ubicación:** `Microservicio_gestion_persistencia/`

### Flujo en Java:

```
RequestBody (JSON)
      │
      ▼
┌──────────────────────┐
│ AnalyzeController    │
│ @PostMapping(/api/v1/analyze)
└──────────────┬───────┘
               │
               ▼
┌──────────────────────┐
│ AnalyzeService       │
│ - Valida JWT token   │
│ - Guarda en history  │
│ - Llama a Python     │
└──────────┬───────────┘
           │
           ▼ RestTemplate
┌──────────────────────┐
│ Python Service       │
│ (POST /analyze)      │
└──────────────────────┘
```

### Validaciones en Java:

1. **JWT Token** (Authorization header)
   - Si falta: 401 UNAUTHORIZED
   - Si es inválido: 401 UNAUTHORIZED

2. **Datos obligatorios**
   - `code` no puede estar vacío
   - Si falta: 400 BAD_REQUEST

3. **Defaults automáticos**
   - `language`: "python"
   - `mode`: "Senior Dev"

### Clases principales:

| Clase | Responsabilidad |
|-------|-----------------|
| `AnalyzeController` | Recibe request HTTP |
| `AnalyzeService` | Orquesta la lógica, llama a Python |
| `AnalyzeRequest` | DTO de entrada (code, language, mode) |
| `AnalyzeResponse` | DTO de salida (issues, explanation, refactored) |
| `IssueDto` | Cada issue detectado (line, message, severity) |
| `AnalyzeHistoryEntry` | Guarda historial con UUID y timestamp |

---

## 3️⃣ Microservicio Python (Analizador)

**Ubicación:** `Microservicio_inferencia_analisis/app.py`

### Lógica de análisis simulada:

```python
@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    # 1. Analiza el código
    issues = []
    
    if "TODO" in code:
        issues.append(Issue(..., severity="warning"))
    
    if "print(" in code:
        issues.append(Issue(..., severity="info"))
    
    # 2. Si no hay issues, devuelve OK
    if not issues:
        issues.append(Issue(..., severity="info"))
    
    # 3. Propone refactoring
    refactored_code = code.replace("print(", "logger.info(")
    
    # 4. Devuelve AnalyzeResponse
    return AnalyzeResponse(
        issues=issues,
        explanation="...",
        refactored_code=refactored_code
    )
```

### Response ejemplo:

```json
{
  "issues": [
    {
      "line": 1,
      "message": "Contiene comentario TODO sin resolver",
      "severity": "warning"
    },
    {
      "line": 1,
      "message": "Uso de print en código de producción",
      "severity": "info"
    }
  ],
  "explanation": "Análisis simulado en modo Senior Dev para lenguaje python",
  "refactored_code": "logger.info('TODO: fix this')"
}
```

---

## 4️⃣ Integración Completa

```
┌────────────────────┐
│  Frontend (React)  │  Port: 3000
│  [Código HTML]     │
└────────┬───────────┘
         │ HTTP POST
         ▼
┌────────────────────────────────────────────────┐
│ Java Microservicio (Spring Boot)               │  Port: 8080
│                                                 │
│ POST /api/v1/analyze                           │
│  ├─ @AnalyzeController                         │
│  │  └─ Recibe: {"code": "...", ...}            │
│  │                                             │
│  └─ @AnalyzeService                            │
│     ├─ validateAuthorization(token)            │
│     ├─ saveToHistory(request)                  │
│     └─ callPythonAnalyzer(request)             │
│           │ HTTP POST                          │
│           ▼                                    │
│        RestTemplate ───────────────────────┐   │
│                                            │   │
└────────────────────────────────────────────┼───┘
                                             │
                                             ▼
                        ┌────────────────────────────────┐
                        │ Python FastAPI                 │  Port: 8000
                        │                                │
                        │ POST /analyze                  │
                        │  ├─ Recibe: AnalyzeRequest     │
                        │  ├─ Analiza código             │
                        │  ├─ Detecta issues             │
                        │  └─ Devuelve: AnalyzeResponse  │
                        └────────────────────────────────┘
```

---

## 5️⃣ Configuración para comunicación entre servicios

### En Java (`application.properties`):
```properties
spring.application.name=gestion
python.service.base-url=http://localhost:8000
```

**En Docker:**
```properties
python.service.base-url=http://microservicio-python:8000
```

### En Python (`app.py`):
- No necesita configuración especial
- FastAPI corre por defecto en `0.0.0.0:8000`

---

## 6️⃣ Flujo completo de datos (paso a paso)

**Usuario:** "Pega código en la UI y presiona Analizar"

```
PASO 1: Frontend
  └─ POST http://localhost:8080/api/v1/analyze
     Authorization: Bearer valid-token
     Body: { "code": "print('hello')", ... }

PASO 2: Java AnalyzeController
  └─ Recibe el JSON en AnalyzeRequest
  └─ Delega a AnalyzeService.analyze()

PASO 3: Java AnalyzeService
  ├─ validateAuthorization() → OK ✓
  ├─ crearHistoryEntry(request) → UUID + timestamp
  ├─ callPythonAnalyzer(request) → RestTemplate POST
  │
  └─ [BLOQUEA aquí hasta que Python responda]

PASO 4: Python FastAPI
  ├─ Recibe AnalyzeRequest
  ├─ Analiza: "print(" detectado
  ├─ issues.append(Issue(...))
  └─ return AnalyzeResponse

PASO 5: Java AnalyzeService (continuación)
  ├─ Recibe AnalyzeResponse de Python
  ├─ historyEntry.setResponse(response)
  └─ return response al Controller

PASO 6: Java AnalyzeController
  └─ 200 OK + AnalyzeResponse JSON

PASO 7: Frontend
  ├─ Renderiza issues por severidad
  ├─ Muestra explicación
  └─ Ofrece código refactorizado
```

---

## 7️⃣ Códigos HTTP esperados

| Caso | Status | Descripción |
|------|--------|-------------|
| Todo OK | 200 | Análisis completado con éxito |
| Falta `code` | 400 | BAD_REQUEST - código obligatorio |
| JWT inválido | 401 | UNAUTHORIZED - token incorrecto |
| Python down | 503 | SERVICE_UNAVAILABLE - no se conecta |
| Error Python | 500 | Si Python devuelve error |

---

## 8️⃣ Características del core actual

✅ **Implementado:**
- Validación JWT básica
- DTOs con Jackson/JSON
- RestTemplate para comunicación
- Historial en memoria (List sincronizado)
- Modelo Pydantic en Python
- Lógica de análisis simulada

🚧 **Pendiente para producción:**
- Base de datos (JPA en Java)
- Seguridad JWT completa (JJWT library)
- Logging estructurado
- Manejo de excepciones mejorado
- Integración con LLM real en Python
- Tests unitarios
- Dockerfiles y docker-compose

---

## 9️⃣ Endpoints disponibles

### Java (http://localhost:8080)
```
POST   /api/v1/analyze         # Envía código para análisis
GET    /api/v1/history         # Ve historial (próximamente)
```

### Python (http://localhost:8000)
```
POST   /analyze                # Recibe código para analizar
GET    /test                   # Health check
GET    /docs                   # Documentación Swagger
```

---

## 🔟 Próximos pasos (Dockerización)

1. Completar `Dockerfile` para Java (Maven build)
2. Completar `Dockerfile` para Python (pip install)
3. Configurar `docker-compose.yml`:
   - Servicio `java` → port 8080
   - Servicio `python` → port 8000
   - Red compartida
4. `.env` para variables (BD, tokens, etc.)
5. Health checks
6. Volúmenes para logs

**Resultado:** `docker-compose up` levanta todo ✨
