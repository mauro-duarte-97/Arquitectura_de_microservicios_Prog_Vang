# Flujo principal del sistema

Este documento describe cómo viaja una petición de auditoría desde que el
usuario pega código en el frontend hasta que ve la respuesta en pantalla.
Refleja el estado actual del sistema (mayo 2026), con todas las piezas
dockerizadas y el modelo qwen2 corriendo en local.

## Componentes y puertos

| # | Servicio | Tecnología | Puerto host | Función |
|---|---|---|---|---|
| 1 | `interfaz_usuario` | React + Vite, servido por Nginx | 5173 → 80 | UI (login, editor, resultado, historial). |
| 2 | `microservicio_gestion_persistencia` | Spring Boot 3 + JWT | 8080 | Orquestador. AuthN/AuthZ, persistencia, llamada al servicio Python. |
| 3 | `microservicio_inferencia_analisis` | FastAPI | 5000 | Análisis con IA. Construye el prompt, llama a Ollama, normaliza el JSON. |
| 4 | `ollama` | Ollama + qwen2 (4.4 GB) | 11434 | LLM local. Modelo precargado en el volumen `ollama_data`. |
| 5 | `postgres` | Postgres 16 | 5432 | Usuarios + historial de auditorías (volumen `postgres_data`). |

Toda la comunicación interna se hace por la red privada de Docker Compose,
usando los nombres de servicio (`postgres`, `ollama`, etc.) como hostnames.
Solo el frontend y el backend Java se exponen al browser; Python y Ollama
quedan accesibles solo desde otros contenedores.

## Diagrama de flujo (caso "Analizar código")

```
[Browser :5173]
     │  POST /api/v1/analyze
     │  Headers: Authorization: Bearer <JWT>
     │  Body: { code, language, mode }
     ▼
[Java :8080] ── JwtAuthenticationFilter
     │   1. Valida el token (jjwt 0.12.6, secret de env).
     │   2. Carga el User desde Postgres (CustomUserDetailsService).
     │   3. AnalyzeController inyecta el principal y llama a AnalyzeService.
     │   4. AnalyzeService hace POST http://microservicio_inferencia_analisis:5000/analyze
     ▼
[Python :5000] ── analyze()
     │   1. check_ollama_availability() (pinga /api/tags de Ollama).
     │   2. Si language == "python": _detect_python_syntax_error(code)
     │      con ast.parse. Devuelve {line, col, message, hint} o None.
     │   3. _build_prompt(code, language, mode, syntax_error):
     │       - Reglas duras (no mezclar lenguajes, español es-AR, etc.).
     │       - Código numerado por línea para que el LLM se ubique.
     │       - Schema explícito con title corto + message detallado.
     │       - Few-shot example (caso typical: expected ':' en Python).
     │       - Hint estructurado según el output del parser.
     │   4. POST http://ollama:11434/api/generate con format=json y
     │      timeout=120s. Modelo: qwen2.
     │   5. Post-procesado:
     │       - Si había syntax error, garantiza que aparezca como issue
     │         critical en la respuesta.
     │       - _strip_code_fences() limpia ```python ... ``` si el modelo
     │         igual envolvió el refactor.
     │       - _safe_issue() normaliza cada issue (line int, severity
     │         válida, title derivado si no vino).
     │   6. Devuelve { issues: [...], explanation, refactored_code }.
     ▼
[Java :8080] ── post-Python
     │   1. Mapea AnalyzeResponse (Jackson, con @JsonAlias para snake_case).
     │   2. Persiste AnalysisHistory:
     │       (id UUID, user_id, language, mode, code, response_json TEXT,
     │        created_at). El response_json incluye también el campo title.
     │   3. Setea historyId en AnalyzeResponse y responde 200.
     ▼
[Browser :5173] ── auditApi.js
     │   1. apiClient resuelve el JSON, normaliza errores (401 dispara
     │      "code-audit-ai:unauthorized" para AuthContext).
     │   2. auditMapper.buildAuditFromAnalyzeResponse:
     │       - mapIssue() pasa cada issue por pickIssueTitle:
     │           a. Si backend trae title corto (≤6 palabras), se respeta.
     │           b. Si no, TITLE_PATTERNS matchea el message contra
     │              etiquetas conocidas (INYECCION SQL, ERROR DE SINTAXIS,
     │              CONTRASENA HARDCODEADA, LOG EN PRODUCCION, etc.).
     │           c. Fallback final: 5 primeras palabras del message en
     │              MAYUSCULAS.
     │       - mapSeverity normaliza (critical|warning|info → critical|
     │         warning|suggestion).
     │   3. Navega a /audit/result/<historyId> con el objeto en state.
     │   4. AuditResult renderea:
     │       - Editor lado a lado (original vs refactored).
     │       - Lista de cards con SeverityBadge + título corto + descripción
     │         + línea afectada.
     │       - Bloque "Explicación pedagógica" con el párrafo de la IA.
```

## Defensa en profundidad para la calidad de respuesta

El sistema asume que el LLM (qwen2) puede equivocarse u omitir campos.
Hay tres capas que se complementan:

1. **Prompt engineering**: reglas explícitas, few-shot, hints del parser.
2. **Post-proceso en Python**: limpieza de fences, normalización de
   severities, derivación automática de `title` si falta, garantía de
   que el syntax error del AST aparezca aunque el modelo lo omita.
3. **Heurísticos en el frontend**: `TITLE_PATTERNS` regex sobre el
   mensaje; jerarquía de fallback en `pickIssueTitle`; severity mapping
   tolerante a sinónimos (`error → critical`, `hint → suggestion`).

Esto permite que la UI sea estable incluso si el modelo:
- Olvida mandar `title`.
- Envuelve `refactored_code` en triple backticks.
- Usa `severity` con un sinónimo no esperado.
- Confunde terminología entre lenguajes (los patrones lo recategorizan).

## Persistencia

- **users**: id UUID, email UNIQUE, username, password_hash (bcrypt),
  role (USER/ADMIN), created_at.
- **analysis_history**: id UUID, user_id FK, language, mode, code TEXT,
  `response_json` TEXT (JSON crudo de Python: issues + explanation +
  refactored_code, e incluye `title` por issue), created_at.

El schema lo crea Flyway en el primer arranque (`V1__init_schema.sql`).
Hibernate solo valida (`ddl-auto=validate`).

## Autenticación

- POST `/api/v1/auth/register` → bcrypt + JWT de 60 minutos.
- POST `/api/v1/auth/login` → mismo JWT.
- El token se guarda en `localStorage` (claves `code-audit-ai.token` y
  `code-audit-ai.user`). En cada request `apiClient` lo adjunta como
  `Authorization: Bearer <token>`.
- En 401, `apiClient` limpia la sesión y emite el evento custom
  `code-audit-ai:unauthorized`. El `AuthContext` reacciona y cualquier
  navegación cae en `/login` por `ProtectedRoute`.

## Endpoints expuestos

Públicos (sin token):
- `GET  /test` y `GET /api/v1/health` (smoke tests).
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET  /swagger-ui/index.html`

Protegidos (JWT obligatorio):
- `GET  /api/v1/auth/me`
- `POST /api/v1/analyze`
- `GET  /api/v1/history` (paginado `page=0&size=20` por default)
- `GET  /api/v1/history/{id}`

## Arranque del sistema

- **Usuario final**: doble-click a `Iniciar.bat` en la raíz del repo.
  Levanta los 5 contenedores con `docker compose up -d --build`,
  espera a que Java y el frontend respondan, y abre el browser en
  `http://localhost:5173`. La primera vez tarda 5-15 min (build de
  imágenes + pull del modelo qwen2). Las siguientes tarda 30-60 s.
- **Detener**: doble-click a `Detener.bat` (`docker compose down`).
  Los volúmenes `ollama_data` y `postgres_data` persisten.
- **Aplicar cambios de código** (durante el desarrollo):
  `docker compose up -d --build <servicio>` rebuildea solo ese servicio
  sin tocar los demás (ej. `microservicio_inferencia_analisis` si solo
  cambió el prompt; `interfaz_usuario` si solo cambió React).

## Plan de trabajo (estado actual)

| Fase | Estado | Notas |
|---|---|---|
| 1. Diseño (OpenAPI, DER, JSON de IA) | ✅ Completo | DER en bitácora, JSON contrato estabilizado. |
| 2. MVP funcional (Java + Python + UI básica) | ✅ Completo | Mayo 13. Frontend con mocks reemplazado por backend real. |
| 3. Features clave (severidades, refactor, historial, multilenguaje) | ✅ Completo | Python/Java/Kotlin, severities mapeadas, historial paginado. |
| 4. Hardening (errores, timeouts, logs, UX) | ✅ Completo | Mayo 15. Anti-cortocircuito, post-procesado, TITLE_PATTERNS, jerarquía de fallback. |
| 5. Entrega (documentación, docker-compose, demo) | 🔄 En curso | One-click listo. Faltan screenshots, DER del PDF, capturas de Swagger. |
