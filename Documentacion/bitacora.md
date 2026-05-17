BITÁCORA DE SESIÓN - Arquitectura de Microservicios
Fecha: 10 de mayo de 2026

OBJETIVOS PRINCIPALES:
- Construir sistema de auditoría de código con microservicios Java y Python
- Enfoque didáctico para aprender interacción frontend-Java-Python
- Comparar versión simple vs versión profesional (Backend-java)
- Enfoque híbrido: comenzar con versión simple, luego agregar complejidad

MICROSERVICIO JAVA (Spring Boot 3.2.5):
✅ Implementado core básico:
- AnalyzeController.java: Endpoint REST /api/v1/analyze
- AnalyzeService.java: Lógica de negocio, validación JWT básica, llamadas HTTP a Python
- DTOs: AnalyzeRequest, AnalyzeResponse, IssueDto
- Configuración Maven con dependencias necesarias

MICROSERVICIO PYTHON (FastAPI):
✅ Implementado API completa:
- app.py con Pydantic models (AnalyzeRequest/Response/Issue)
- Endpoint POST /analyze con lógica de análisis simulada
- Detección de TODO y print() statements
- requirements.txt con dependencias: fastapi, uvicorn, pydantic
- Dockerfile actualizado

PROBLEMAS RESUELTOS:
✅ Instalación de dependencias Python en entorno virtual
✅ Política de ejecución PowerShell bloqueando scripts
✅ Configuración correcta de host (127.0.0.1 vs 0.0.0.0)
✅ Importación correcta del módulo app.py

ESTADO ACTUAL:
✅ Servidor Python corriendo en http://127.0.0.1:8000
✅ Código Java compila correctamente
🔄 Pendiente: Probar integración completa Java-Python
🔄 Pendiente: Levantar servidor Java y probar flujo completo
🔄 Pendiente: Agregar funcionalidades del Backend-java profesional

SIGUIENTES PASOS PROPUESTOS:
1. Probar endpoint Python con curl/Invoke-WebRequest
2. Levantar servidor Java en puerto 8080
3. Probar llamada desde Java a Python
4. Implementar frontend básico para probar flujo completo
5. Comparar e integrar elementos del Backend-java (JPA, RabbitMQ, PostgreSQL)

LECCIONES APRENDIDAS:
- Importancia de entornos virtuales en Python
- Diferencias entre PowerShell y CMD en Windows
- Uso de RestTemplate para llamadas HTTP en Spring
- Validación de datos con Pydantic en FastAPI
- Configuración de CORS para comunicación entre servicios

Fecha: 11 de mayo de 2026

AVANCES DEL DÍA:
✅ Resueltos problemas críticos en microservicio Python:
- Corregida versión de Ollama en requirements.txt (0.0.47 → 0.6.2)
- Implementada verificación de sintaxis con ast.parse para detectar errores de sintaxis reales antes de análisis IA
- Mejorado manejo de errores: ahora muestra errores específicos de Ollama en lugar de respuestas genéricas
- Aumentado timeout de requests a 60 segundos para respuestas de IA

✅ Sistema de análisis ahora funciona correctamente:
- Detecta errores de sintaxis (SyntaxError) inmediatamente y los reporta como críticos
- Para código válido, envía a Ollama para análisis profundo de calidad, lógica y mejores prácticas
- Respuestas detalladas con issues, explicaciones y código refactorizado

✅ Probado y validado:
- Código con errores: detecta SyntaxError correctamente
- Código válido: análisis con IA funciona (ej: sugerencias de mejora en prints, lógica, etc.)

PROBLEMAS RESUELTOS:
✅ Respuestas genéricas sobre prints cuando había errores de sintaxis
✅ Fallos silenciosos de Ollama sin feedback útil
✅ Detección pobre de errores de sintaxis por parte del modelo IA

ESTADO ACTUAL:
✅ Microservicio Python completamente funcional con análisis inteligente
✅ Microservicio Java listo para integración
🔄 Pendiente: Integración completa Java-Python
🔄 Pendiente: Pruebas de comunicación entre servicios
🔄 Pendiente: Dockerización y despliegue con docker-compose

SIGUIENTES PASOS PROPUESTOS:
1. Levantar servidor Java (Spring Boot) en puerto 8080
2. Probar llamadas HTTP desde Java a Python usando RestTemplate
3. Verificar flujo completo: Frontend → Java → Python → Respuesta
4. Implementar manejo de errores en la comunicación entre servicios
5. Agregar logging y monitoreo básico
6. Documentar API completa y flujo de datos
7. Considerar mejoras: soporte para más lenguajes, integración con base de datos, autenticación JWT completa

LECCIONES APRENDIDAS HOY:
- Los modelos de IA como Ollama son excelentes para análisis de calidad pero no para detección de sintaxis; usar herramientas nativas como ast.parse
- Importancia de timeouts apropiados para requests a servicios de IA
- Mejorar UX mostrando errores específicos en lugar de genéricos
- Verificación de sintaxis antes de análisis profundo mejora eficiencia y precisión

================================================================
Sesión 11 de mayo de 2026 (tarde) - Persistencia + Seguridad
================================================================

OBJETIVO:
Integrar PostgreSQL al microservicio Java para persistir el historial
de análisis y agregar autenticación de usuarios con JWT (registro y
login), preparando el camino para el frontend.

DECISIONES DE DISEÑO:
- PostgreSQL gestionado vía Docker (servicio en docker-compose.yml).
- Migraciones versionadas con Flyway (V1__init_schema.sql).
- ddl-auto = validate (Hibernate solo valida, Flyway crea el esquema).
- Estructura de paquetes plana en com.tp.gestion (menos refactor).
- Java actualizado de 17 a 21 LTS (Temurin) en pom.xml y Dockerfile.
- Spring Security 6.x + filtro JWT propio con jjwt 0.12.6.
- BCryptPasswordEncoder para hashing de contraseñas.
- Historial guardado como entidad JPA AnalysisHistory; el response del
  servicio Python se persiste como TEXT JSON (response_json).
- CORS permisivo en desarrollo para los orígenes del frontend (3000, 5173).

ESQUEMA DE BASE DE DATOS:
- users(id UUID PK, email UNIQUE, username, password_hash, role, created_at)
- analysis_history(id UUID PK, user_id FK -> users.id, language, mode,
                   code TEXT, response_json TEXT, created_at)
- Índices: idx_users_email, idx_history_user_created.

NUEVAS DEPENDENCIAS (pom.xml):
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- spring-boot-starter-validation
- postgresql (driver)
- flyway-core + flyway-database-postgresql
- jjwt-api / jjwt-impl / jjwt-jackson (0.12.6)
- spring-security-test (scope test)

ARCHIVOS NUEVOS:
- src/main/resources/db/migration/V1__init_schema.sql
- com.tp.gestion.Role (enum USER/ADMIN)
- com.tp.gestion.User (entity + UserDetails)
- com.tp.gestion.UserRepository
- com.tp.gestion.AnalysisHistory (entity)
- com.tp.gestion.AnalysisHistoryRepository
- com.tp.gestion.AnalysisHistoryResponse (DTO)
- com.tp.gestion.JwtService
- com.tp.gestion.JwtAuthenticationFilter
- com.tp.gestion.CustomUserDetailsService
- com.tp.gestion.SecurityConfig
- com.tp.gestion.AuthService
- com.tp.gestion.AuthController
- com.tp.gestion.HistoryService
- com.tp.gestion.HistoryController
- com.tp.gestion.RegisterRequest / LoginRequest / AuthResponse / UserResponse

REFACTORS:
- AnalyzeService: elimina lista en memoria; ahora persiste cada análisis
  asociado al usuario autenticado y borra el check artesanal de "Bearer valid-token"
  (lo reemplaza el JwtAuthenticationFilter global).
- AnalyzeController: recibe @AuthenticationPrincipal User en lugar de
  manejar manualmente el header Authorization.
- AnalyzeRequest: agrega @NotBlank en code.
- application.properties: configuración completa de datasource, JPA,
  Flyway, JWT y CORS, todo override-able por variables de entorno.
- docker-compose.yml: agrega servicio postgres:16-alpine con volumen y
  healthcheck; el servicio Java espera con depends_on -> service_healthy.
- Dockerfile: actualiza imagen base a temurin 21.
- Eliminado AnalyzeHistoryEntry.java (POJO obsoleto).

ENDPOINTS RESULTANTES (http://localhost:8080):
Públicos:
  GET  /test
  GET  /api/v1/health
  POST /api/v1/auth/register
  POST /api/v1/auth/login
Protegidos (JWT obligatorio):
  GET  /api/v1/auth/me
  POST /api/v1/analyze
  GET  /api/v1/history
  GET  /api/v1/history/{id}

SIGUIENTES PASOS:
1. Probar el flujo completo en Postman: register -> login -> analyze -> history.
2. Probar errores: registro duplicado (409), login incorrecto (401),
   analyze sin token (401), token inválido (401).
3. Verificar que Flyway aplica V1__init_schema.sql en el primer arranque.
4. Empezar el frontend (puede ser React/Vite en el directorio Interfaz_usuario).
5. Considerar refresh tokens si la sesión de 60 min no alcanza.

================================================================
Sesión 12 de mayo de 2026 - Dockerización end-to-end y pruebas
================================================================

OBJETIVO:
Levantar TODO el stack con un único `docker compose up --build` y
validar el flujo completo (register -> login -> analyze -> history)
desde Postman, sin depender de procesos Java/Python locales.

PROBLEMAS DETECTADOS Y RESUELTOS:

1) Puerto del microservicio Python mal configurado en el Dockerfile.
   - El Dockerfile arrancaba uvicorn en el puerto 8000.
   - docker-compose.yml mapea 5000:5000 y Java llama a
     http://microservicio_inferencia_analisis:5000.
   - Resultado: Java devolvía 503 Service Unavailable en /analyze.
   - Fix: Microservicio_inferencia_analisis/Dockerfile -> port 5000
     y se agregó EXPOSE 5000.

2) Ollama inalcanzable desde dentro del contenedor Python.
   - En app.py la URL estaba hardcodeada como http://localhost:11434,
     que dentro del contenedor apunta al propio contenedor, no al host.
   - Fix en app.py: lectura de OLLAMA_BASE_URL y OLLAMA_MODEL desde
     variables de entorno (default localhost para dev nativo).
   - Fix en docker-compose.yml: se pasa
       OLLAMA_BASE_URL=http://host.docker.internal:11434
     y se agrega extra_hosts: "host.docker.internal:host-gateway"
     para compatibilidad con Linux (en Windows/Mac Docker Desktop ya lo provee).

3) OLLAMA_AVAILABLE evaluado una sola vez al startup.
   - Si Ollama no estaba arriba cuando arrancaba el contenedor Python,
     quedaba "no disponible" para siempre (aunque después se prendiera).
   - Fix: check_ollama_availability() ahora se llama por request, y
     /test la recomputa también.

ARCHIVOS NUEVOS:
- Microservicio_inferencia_analisis/.dockerignore (excluye venv/,
  __pycache__/, *.pyc, etc.; reduce el tamaño de la imagen y evita
  copiar bytecode incompatible de Python 3.13/3.14 dentro de la
  imagen de Python 3.10).
- Microservicio_gestion_persistencia/.dockerignore (excluye target/,
  .git/, .idea/; acelera el build context que Maven recibe).

ARCHIVOS MODIFICADOS:
- Microservicio_inferencia_analisis/Dockerfile (puerto 5000).
- Microservicio_inferencia_analisis/app.py (OLLAMA_BASE_URL por env,
  chequeo de disponibilidad por request, /test devuelve también la
  URL configurada).
- docker-compose.yml (env vars de Ollama + extra_hosts en el servicio
  Python).

VALIDACIONES HECHAS:

- `docker compose config --quiet` -> compose sintácticamente válido.
- `docker compose up --build` levanta los 3 servicios sin error:
    * postgres -> Healthy, ready to accept connections en 5432.
    * Flyway aplica V1__init_schema correctamente al primer arranque.
    * microservicio_gestion_persistencia -> Tomcat started on 8080.
    * microservicio_inferencia_analisis -> Uvicorn on 0.0.0.0:5000.
- GET http://localhost:8080/test  -> 200 "Java OK".
- GET http://localhost:5000/test  -> 200 con JSON:
    {"status":"ok", "ollama_available":false,
     "ollama_base_url":"http://host.docker.internal:11434",
     "model":"none"}
  Confirma que la URL hacia el host está bien configurada;
  ollama_available=false porque todavía no se levantó Ollama
  en el host (probaremos el camino con IA en la próxima sesión).

PRUEBAS DE FLUJO COMPLETO EN POSTMAN:
- POST /api/v1/auth/register -> 201 con accessToken + user.
- POST /api/v1/analyze sin Authorization -> 403 Forbidden
  (comportamiento esperado: la ruta exige JWT).
- POST /api/v1/analyze con Bearer Token -> 200 con el análisis
  simulado (fallback) porque Ollama no está activo:
    {"issues":[{"line":0,"message":"No se detectaron problemas graves",
                 "severity":"info"}],
     "explanation":"Análisis simulado en modo senior-dev para
                    lenguaje python. Nota: Ollama no disponible",
     "refactoredCode":null}
- Persistencia verificada: cada análisis queda guardado en la tabla
  analysis_history de Postgres (consultable vía
  `docker compose exec postgres psql -U auditoria -d auditoria`
  o vía GET /api/v1/history con el mismo token).

CONCEPTOS REFORZADOS DE JWT:
- Duración del token: 60 minutos (app.jwt.expiration-minutes=60,
  override-able por JWT_EXPIRATION_MINUTES).
- La respuesta de /register y /login incluye "expiresInMinutes".
- Códigos de estado a esperar:
    * 403 -> no se envió el header Authorization.
    * 401 -> token vencido, mal formado o usuario inexistente.
- Truco: GET /api/v1/auth/me como "ping" barato para chequear si el
  token sigue vivo.
- El mismo token sirve para GET y POST de cualquier endpoint
  protegido; no hay tokens diferentes por método HTTP.
- Tip de Postman para no andar copiando el token a mano:
    pestaña Scripts -> Post-response en /login:
        const json = pm.response.json();
        pm.collectionVariables.set("token", json.accessToken);
    y en el resto de las requests usar Bearer Token = {{token}}.

LECCIONES APRENDIDAS HOY:
- "localhost" dentro de un contenedor es el propio contenedor; para
  hablar con servicios del host se usa host.docker.internal (Windows/Mac)
  o el truco extra_hosts host-gateway (Linux).
- Las decisiones de puerto deben quedar consistentes entre Dockerfile
  (EXPOSE/CMD), docker-compose.yml (ports) y la URL que usa el cliente
  (Java apuntando a Python).
- Para evitar tokens duplicados o expiraciones inesperadas conviene
  centralizar la captura del token en un script post-response de Postman.
- El volumen `postgres_data` mantiene los datos entre reinicios; solo
  `docker compose down -v` los borra.

SIGUIENTES PASOS:
1. Probar el camino con IA real:
   - Instalar/iniciar Ollama en el host (`ollama serve`).
   - `ollama pull qwen2` (o el modelo que se prefiera).
   - Verificar que GET /test del microservicio Python devuelve
     "ollama_available": true.
   - Re-tirar POST /api/v1/analyze con un caso pedagógico
     (ej.: println('Hola Mundo') con language=python) y validar que
     la explicación detecta que println no pertenece a Python.
2. Documentar la guía de despliegue final con docker-compose en el
   README/PDF del entregable.
3. Empezar el frontend en Interfaz_usuario:
   - React + Vite, editor con resaltado (Monaco o CodeMirror).
   - Vista de login/register, vista de análisis, vista de historial.
   - CORS ya está habilitado para http://localhost:3000 y 5173.
4. Capturar la API en Swagger UI (http://localhost:8080/swagger-ui.html)
   o exportar una colección de Postman para anexar al informe.
5. Endurecer la respuesta del fallback:
   - Devolver refactoredCode con el código original en lugar de null
     cuando no haya nada para refactorizar (mejor DX para el frontend).
6. Considerar healthcheck propio para el servicio Python en
   docker-compose.yml y cambiar el depends_on de Java a
   condition: service_healthy.
7. Probar con código en otros lenguajes (Java, Kotlin) para verificar
   los caminos del fallback y de Ollama.
8. Refresh tokens / sesiones largas (opcional, evaluar si vale la pena
   para el alcance del TP).

================================================================
Sesión 13 de mayo de 2026 - Conexión del frontend al backend
================================================================

OBJETIVO:
Conectar la interfaz de usuario (Interfaz_usuario, React + Vite) al
microservicio Java de gestión. Hasta esta sesión el frontend estaba
100% desconectado, con un auditApi.js completamente mockeado y datos
de un mockAudits.js. La meta era cerrar el ciclo end-to-end:
registro -> login -> selección de lenguaje -> análisis -> historial,
consumiendo los endpoints reales de Spring Boot y mostrando la
respuesta de la IA Python.

=== PASO 1 - ANÁLISIS DEL FRONTEND VS CONTEXTO.MD ===

Verificamos que el frontend ya cumplía a nivel UI todas las consignas:
  - Editor con resaltado de sintaxis -> Monaco Editor.
  - Severidades Crítico/Advertencia/Sugerencia -> SeverityBadge.
  - Historial por usuario -> página History + AuditTable.
  - Refactor + explicación pedagógica -> AuditResult.
  - Multilenguaje (>=3) -> selector con varios lenguajes.
Conclusión: la UI cumplía, pero todo era mock. Faltaba conectar y
proteger rutas.

DIFERENCIAS DE CONTRATO DETECTADAS ENTRE FRONTEND Y BACKEND:
- Login: backend devuelve { accessToken, tokenType, expiresInMinutes,
  user }. El mock guardaba "token" plano.
- Register: backend exige { email, username, password } con password
  de mínimo 8 chars. El frontend pedía { name, email, password,
  confirmPassword }.
- /analyze del backend devuelve { issues:[{line,message,severity}],
  explanation, refactoredCode } con severities critical|warning|info.
  El frontend esperaba un shape más rico (title, summary, type,
  description, recommendation, globalSeverity, etc.). Se resolvió
  con una capa de mapeo en el frontend (no se tocaron los DTOs Java).
- /history devuelve Page<...> de Spring; el frontend esperaba array
  plano. Se extrae .content en el cliente.
- No había rutas protegidas, ni logout funcional, ni datos del usuario
  reales (Pablo Gonzalez aparecía hardcodeado en varios lugares).

=== PASO 2 - DECISIONES DE DISEÑO ===

Las cuatro decisiones que orientaron toda la implementación se
acordaron con el usuario antes de tocar código (formulario de
preguntas):

- Límite del editor de código: 2000 caracteres.
  Razón: el microservicio Python usa Ollama con un modelo gratuito
  (qwen2). Mantener el prompt acotado evita sobrecargar al agente
  y deja latencias razonables. 2000 chars ~ 500 tokens, suficiente
  para una función o clase chica/mediana.
- Lenguajes en el selector: solo Python, Java, Kotlin (mínimo del
  Contexto.md; se eliminó JavaScript del selector original).
- Token storage: localStorage. Sobrevive a refresh y al cierre del
  navegador. Trade-off conocido contra XSS pero aceptable para el TP.
- Dashboard: métricas del último análisis (no promedios ni mock).
- Settings: solo-lectura mostrando username/email/role + botón
  Cerrar sesión (no hay endpoints de edición de perfil y no aporta
  al objetivo del TP).
- API base URL: variable de entorno VITE_API_BASE_URL con default
  http://localhost:8080. .env.example versionado, .env ignorado.

=== ARQUITECTURA DE LA CAPA NUEVA EN EL FRONTEND ===

ARCHIVOS NUEVOS:
- src/services/apiClient.js
    Cliente HTTP central basado en fetch.
    * Adjunta Authorization: Bearer <token> si auth=true.
    * Normaliza errores Spring leyendo message/error/detail/errors[].
    * Da un mensaje claro si el backend no responde (en vez de
      "respuesta 0 desconocida" que tira fetch).
    * En 401 limpia la sesión y dispara un evento custom
      "code-audit-ai:unauthorized" para que el AuthContext reaccione
      sin esperar a un refresh manual.
    * Storage keys: code-audit-ai.token, code-audit-ai.user.

- src/context/AuthContext.jsx
    Provider con estado global { user, token, isAuthenticated }
    y hooks login()/logout(). Re-hidrata desde localStorage al
    montar. Reacciona al evento "code-audit-ai:unauthorized" y al
    storage event (sincroniza si se desloguea en otra pestaña).

- src/components/ProtectedRoute.jsx
    Guarda las rutas internas. Si no hay token redirige a /login
    preservando la ruta original en location.state.from para que
    el Login pueda hacer redirect-back.

- src/utils/auditMapper.js
    Adapta los DTOs del backend al modelo histórico del frontend
    sin tocar los componentes:
    * mapSeverity: critical/warning/info -> critical/warning/
      suggestion (más algunos alias: error->critical, hint->
      suggestion, etc.).
    * pickWorstSeverity: calcula globalSeverity tomando el peor
      severity de la lista.
    * buildAuditFromAnalyzeResponse: combina la respuesta del
      backend con el código original y el lenguaje para construir
      el objeto que renderean Dashboard/AuditResult/History.
    * mapHistoryEntry: idem para los items de /api/v1/history.

- src/config/auditConfig.js
    MAX_CODE_CHARS = 2000 y SUPPORTED_LANGUAGES (Python, Java,
    Kotlin) centralizados para reutilizar y para que cambiarlos
    sea trivial.

- vite.config.js
    Faltaba en el repo (sin él Vite no procesa JSX). Activa
    @vitejs/plugin-react y fija el puerto 5173 explícitamente.

- .env.example
    VITE_API_BASE_URL=http://localhost:8080 documentado para que
    cualquiera pueda clonar el repo y arrancar.

ARCHIVOS REESCRITOS:
- src/App.jsx
    Router con guardas: si hay sesión y se entra a /login o
    /register redirige a /dashboard; si no hay sesión y se entra
    a cualquier ruta protegida redirige a /login. Catch-all "*"
    cae al / (que a su vez decide login o dashboard).
- src/main.jsx
    Envuelve <App/> con <AuthProvider/>.
- src/services/auditApi.js
    Reescrito de cero, sin mocks. Funciones:
    * loginUser, registerUser, fetchCurrentUser
    * analyzeCode (manda { code, language, mode } a /api/v1/
      analyze y construye el objeto del frontend).
    * getAuditHistory (paginado), getAuditById.
- src/pages/Login.jsx
    Conectado, manejo de errores, redirige a redirectTo
    (location.state.from || /dashboard). Quitamos los valores
    default "pablo@mail.com/123456" que estaban como placeholder.
- src/pages/Register.jsx
    Campos: username, email, password, confirmPassword. Valida
    coincidencia de passwords y largo >= 8 en cliente antes de
    pegarle al backend.
- src/pages/NewAudit.jsx
    * Solo Python/Java/Kotlin en el select.
    * Contador de caracteres en tiempo real con colores
      (slate -> yellow -> amber -> red según se acerque al
      límite).
    * Mensaje explícito de "superaste el límite" y deshabilita
      el botón si está vacío o por encima del cap.
    * Subraya en el aside que la IA es gratuita y por eso se
      acota el input.
- src/pages/AuditResult.jsx
    Usa la respuesta del state si vino de NewAudit; si la ruta
    se accede por URL (refresh, share, etc.) llama a
    /history/{id} con el mapper.
- src/pages/Dashboard.jsx
    Hace getAuditHistory({size:5}) al montar y calcula las tres
    métricas (críticos/warnings/sugerencias) del primer item.
    Muestra el username real.
- src/pages/History.jsx
    Carga el historial paginado, muestra estado vacío amable
    cuando no hay auditorías, y maneja errores.
- src/pages/Settings.jsx
    Solo-lectura. Renderea username/email/role del usuario
    autenticado + botón Cerrar sesión con redirect a /login.
- src/layouts/AppLayout.jsx
    Sidebar con username real (no Pablo Gonzalez hardcodeado),
    rol formateado y botón logout funcional con redirect.
- src/components/IssueCard.jsx
    Tolera issue.recommendation vacía (no renderea la caja
    "Recomendación" si no llega del backend).
- README.md del frontend
    Instrucciones reales, endpoints consumidos, estructura, y
    sección "Cómo correrlo" con dos opciones (dos terminales o
    docker compose -d) más una tabla de chequeo de salud por
    servicio.

ARCHIVOS ELIMINADOS:
- src/data/mockAudits.js

=== CAMBIOS EN EL BACKEND JAVA (mínimos pero necesarios) ===

- AnalyzeResponse.java:
    * @JsonAlias({"refactored_code"}) sobre refactoredCode.
      Fix de un bug PREEXISTENTE: el microservicio Python emite
      el campo en snake_case y sin alias Jackson nunca lo
      deserializaba al camelCase del DTO Java, por lo cual el
      "código refactorizado" siempre llegaba null al frontend.
    * Nuevo campo historyId (UUID). Se completa después de
      persistir el análisis, así el frontend puede navegar a
      /audit/result/{historyId} con un id real y sobrevivir a
      un refresh de la página.
    * @JsonInclude(NON_NULL) para no enviar nulls al frontend.

- AnalyzeService.java:
    * persistHistory() ahora retorna el UUID generado en lugar
      de void.
    * analyze() llama a setHistoryId() en la respuesta antes de
      devolverla.

No se tocaron migraciones de Flyway ni SecurityConfig: las rutas
ya estaban bien permisivas para /auth/* y bien protegidas para
el resto, y el CORS ya tenía 5173 en la whitelist desde la
sesión del 11 de mayo.

=== DIAGNÓSTICO DE ERRORES AL PRIMER ARRANQUE ===

En el primer intento de levantar todo aparecieron dos "errores"
que en realidad no lo eran:

1) HTTP 403 al abrir http://localhost:8080 desde el browser.
   - Comportamiento esperado. Spring Security exige JWT en todo
     salvo /api/v1/auth/register, /api/v1/auth/login, /test,
     /api/v1/health y swagger. Entrar a "/" sin token = 403.
   - Para validar que el backend vive desde el browser:
       http://localhost:8080/test
       http://localhost:8080/swagger-ui/index.html

2) ERR_CONNECTION_REFUSED al abrir http://localhost:5173.
   - El frontend NO estaba corriendo. La causa fue de UX del
     README: las cuatro líneas
       docker compose up --build
       cd Interfaz_usuario
       npm install
       npm run dev
     se ejecutaron como un bloque pero docker compose up se
     queda en foreground (es un servidor) y bloquea la terminal,
     por lo que cd/npm install/npm run dev nunca corrieron.
   - Fix del README: instrucciones explícitas con dos
     alternativas (dos terminales o `docker compose up -d`)
     y aclaración del 403.

=== MAPA DE PUERTOS (estado actual del sistema) ===

  5173 - Frontend Vite/React (vite.config.js + CORS del backend)
  8080 - Backend Java Spring Boot (application.properties +
         docker-compose.yml)
  5000 - Backend Python FastAPI (Dockerfile python + compose +
         PYTHON_SERVICE_URL en compose para que Java le hable)
  5432 - PostgreSQL (compose + POSTGRES_PORT en application.
         properties)
 11434 - Ollama en el host (default del binario; el contenedor
         Python lo alcanza por host.docker.internal:11434
         gracias al extra_hosts del compose).

CORS whitelist (app.cors.allowed-origins en .properties):
  http://localhost:3000, http://localhost:5173

=== FLUJO END-TO-END VALIDADO ===

1) Usuario abre http://localhost:5173 -> redirige a /login.
2) Register -> POST /api/v1/auth/register -> 201, guarda
   accessToken + user en localStorage, redirige a /dashboard.
3) Login -> POST /api/v1/auth/login -> 200, idéntico flujo.
4) Nueva auditoría -> selecciona Python/Java/Kotlin, escribe
   código (hard cap 2000 chars con feedback visual), click
   "Analizar" -> POST /api/v1/analyze con Bearer token -> 200.
5) Frontend navega a /audit/result/<historyId> y renderea:
   - código original y código refactorizado lado a lado,
   - lista de issues con badge de severidad y línea afectada,
   - explicación pedagógica de la IA.
6) Historial: GET /api/v1/history?page=0&size=20 con Bearer ->
   AuditTable con badge por entrada.
7) Logout (sidebar o Settings) -> limpia localStorage, navega
   a /login.

CONSIDERACIONES OPERATIVAS:
- Si el token vence o se invalida, la próxima request devuelve
  401, apiClient limpia la sesión y emite el evento custom; el
  AuthContext reacciona y la siguiente navegación cae en el
  ProtectedRoute -> /login. No hace falta refresh.
- El campo historyId del response permite refrescar la página
  de resultado sin perder el detalle.

=== ESTADO FINAL DE LA SESIÓN ===
Los 3 servicios levantan con docker compose up --build y el
frontend en npm run dev sobre 5173. El flujo completo se probó
manualmente y funciona. El frontend ya NO tiene mocks: todo
viene del backend real.

PRÓXIMOS PASOS:

CORTO PLAZO (para terminar el entregable del TP):
1. Probar el camino con IA real activada:
   - Levantar `ollama serve` en el host.
   - `ollama pull qwen2` (o el modelo que se prefiera).
   - Verificar que GET http://localhost:5000/test devuelve
     "ollama_available": true.
   - Hacer un análisis desde el frontend con un caso pedagógico
     real (ej.: SQL Injection en Python, catch genérico en Java,
     null safety mal usada en Kotlin) y validar que la IA
     responde con explicación y refactor.
2. Tomar capturas de pantalla del flujo completo
   (Login -> Register -> Dashboard -> NewAudit con contador ->
   Loading -> Result con issues y refactor -> History) para
   anexarlas al PDF de entrega.
3. Exportar la API en Swagger UI
   (http://localhost:8080/swagger-ui/index.html) o como
   colección de Postman, y adjuntarlo al informe.
4. Diagrama de arquitectura final (frontend 5173 -> Java 8080
   -> Python 5000 -> Ollama 11434; con Postgres 5432 colgando
   de Java). Reusable para la sección "Diagramas de
   Arquitectura" del PDF.
5. Documentar el DER de la base (tablas users y
   analysis_history) para la sección "Diseño de Base de Datos"
   del PDF.

MEDIANO PLAZO (mejoras opcionales si sobra tiempo):
6. Endurecer el fallback del microservicio Python para que
   issues nunca venga vacío y refactoredCode nunca venga null
   (siempre devolver el código original como mínimo).
7. Mostrar fecha + lenguaje en la card de cada issue para más
   contexto pedagógico.
8. Empaquetar el frontend en Docker y descomentar el bloque
   interfaz_usuario en docker-compose.yml para que todo el
   stack levante con un único comando.
9. Agregar healthcheck propio al servicio Python en
   docker-compose.yml y pasar el depends_on de Java a
   condition: service_healthy.

LARGO PLAZO (si se quisiera escalar más allá del TP):
10. Mover el JWT a httpOnly cookie en vez de localStorage para
    mitigar XSS.
11. Refresh tokens / sesiones largas.
12. Tests automáticos: unit tests del mapper, tests de
    integración con MockMvc en Java, tests de componentes con
    Vitest en el frontend.
13. CI básico (GitHub Actions) que corra los tests y haga
    docker build en cada PR.
<<<<<<< Updated upstream
=======

================================================================
Sesión 15 de mayo de 2026 - One-click launcher: todo en Docker
================================================================

OBJETIVO:
Que el usuario final solo necesite Docker Desktop instalado, y
arranque el sistema completo (frontend + Java + Python + IA +
DB) con UN doble-click. Sin instalar Node, sin instalar Ollama
en el host, sin abrir tres terminales.

DECISIONES (consensuadas con el usuario):
- Mantener qwen2 como modelo de IA (qwen3 / qwen3-coder quedan
  como feature futuro si sobra tiempo).
- Dockerizar Ollama (sin GPU passthrough). La PC del usuario
  corre Ollama en CPU pura (confirmado por logs: total vram=0B,
  library=cpu). Penalización esperada: 10s -> 12-15s por
  request, aceptable a cambio de eliminar la dependencia de
  Ollama en el host.
- Dockerizar el frontend con build estático servido por nginx.
- Lanzador: archivo .bat (no .exe). Razones:
    * Sin falsos positivos de antivirus (ps2exe los gatilla).
    * Sin advertencia de SmartScreen en primera ejecución.
    * Transparente: el evaluador puede abrirlo y leer qué hace.
    * Cero mantenimiento (no requiere recompilar).
- Único requisito en una PC nueva: Docker Desktop.

ARCHIVOS NUEVOS:

- Ollama_servicio/Dockerfile
    Extiende ollama/ollama:latest con un entrypoint custom.
- Ollama_servicio/entrypoint.sh
    Arranca `ollama serve` en background, espera a que esté
    listo, y hace `ollama pull qwen2` solo si el modelo no
    está ya descargado en el volumen `ollama_data`. Después
    cede el control al proceso de ollama (wait $SERVER_PID)
    para que docker reciba sus señales.

- Interfaz_usuario/Dockerfile
    Multi-stage: stage 1 node:20-alpine corre `npm ci` y
    `npm run build`; stage 2 nginx:alpine sirve el dist/. La
    URL del backend se inyecta vía ARG VITE_API_BASE_URL en
    build time (Vite resuelve import.meta.env.VITE_* al
    compilar; no se puede hacer runtime sin más lógica).
- Interfaz_usuario/nginx.conf
    Server simple en puerto 80, soporte SPA (try_files →
    /index.html), cache agresivo en assets versionados,
    error_page 404 → /index.html.
- Interfaz_usuario/.dockerignore
    Excluye node_modules, dist, .env*, .git, etc.

- Iniciar.bat (raíz del repo)
    1) Chequea que Docker Desktop esté corriendo (`docker info`).
       Si no, mensaje claro y exit.
    2) `docker compose up -d --build` (la primera vez tarda
       5-15 min porque baja imágenes y modelo qwen2).
    3) Espera con polling al backend Java en :8080/test
       (timeout 2 min).
    4) Espera con polling al frontend en :5173 (timeout 1 min).
    5) `start "" http://localhost:5173` abre el navegador
       default.
    Codificación UTF-8, título y color custom, mensajes claros.
- Detener.bat (raíz del repo)
    `docker compose down`. Recordatorio de que los datos
    persisten en volúmenes Docker (no se pierden al detener).

ARCHIVOS MODIFICADOS:

- docker-compose.yml
    Se agregaron 2 servicios nuevos: `ollama` y
    `interfaz_usuario`. El microservicio Python ahora
    apunta a OLLAMA_BASE_URL=http://ollama:11434 (red interna
    de Docker) en lugar de host.docker.internal, y
    `depends_on` lo encadena a ollama healthy.
    `microservicio_inferencia_analisis` ya no necesita el
    bloque `extra_hosts` porque ya no habla al host.
    Ollama tiene healthcheck con 60 retries cada 5s
    (5 minutos) para tolerar el primer pull del modelo.
    Frontend service inyecta VITE_API_BASE_URL como build
    arg para que el bundle apunte a localhost:8080 (es el
    browser quien hace la request, no el contenedor).
- README.md (raíz, NUEVO archivo)
    Punto de entrada para usuario final. Explica el
    one-click, requisitos, URLs útiles, comandos típicos de
    docker, estructura del repo, stack, y modo desarrollo.
- Interfaz_usuario/README.md
    Reescrito para enfocarse en modo desarrollo (HMR con
    `npm run dev` mientras el resto del stack corre en
    Docker). El flujo "para usar la app" referencia al
    README de la raíz.

EXPERIENCIA DEL USUARIO FINAL (en una PC limpia):

1. Instala Docker Desktop (una vez).
2. Descarga el ZIP del proyecto / clona el repo.
3. Doble-click en Iniciar.bat.
4. Espera 5-15 minutos la primera vez (build + descarga del
   modelo qwen2).
5. Se abre Chrome en http://localhost:5173.
6. Se registra, loguea y empieza a usar.

Las siguientes veces: doble-click en Iniciar.bat → 30-60
segundos → app lista.

CONSIDERACIONES TÉCNICAS:

- El modelo qwen2 se persiste en el volumen `ollama_data`
  de Docker, así que la descarga de 4 GB solo ocurre una vez
  por máquina. Si el usuario hace `docker compose down`
  conserva el modelo; solo con `docker compose down -v` lo
  borraría.
- Postgres también persiste en `postgres_data`, así que
  detener + iniciar no pierde usuarios ni historial.
- El frontend dockerizado pierde HMR. Para iterar sobre la
  UI se usa el modo desarrollo documentado en el README del
  frontend: levantar todos los servicios MENOS
  interfaz_usuario y usar `npm run dev` aparte.
- En Windows con CPU pura (sin GPU NVIDIA), Ollama
  dockerizado tiene una penalización de ~20-30% vs Ollama
  nativo, aceptable para la demo.

PRÓXIMOS PASOS:

INMEDIATOS:
1. Ejecutar Iniciar.bat por primera vez y validar el flujo
   end-to-end (es el "primer arranque real" del modo todo
   dockerizado). Tiempo esperado: 5-15 min de build.
2. Si funciona, registrar + loguear + hacer una auditoría
   simple para confirmar que Ollama responde dentro del
   contenedor.

PARA LA ENTREGA DEL TP:
3. Screenshots del flujo completo (Login → Register →
   Dashboard → NewAudit → Result → History → Iniciar.bat en
   acción).
4. Diagrama de arquitectura actualizado (5 contenedores
   + 2 volúmenes).
5. Capturas de Swagger UI para la sección API del PDF.
6. DER de la BD para la sección "Diseño de Base de Datos".

MEJORAS OPCIONALES (si sobra tiempo):
7. Personalizar Iniciar.bat para mostrar progreso visual
   (barra de % o spinner) durante el build inicial.
8. Probar qwen3-coder:7b como upgrade del modelo (mejor
   calidad de análisis, latencia un poco mayor).
9. Healthcheck propio del microservicio Python en compose
   y depends_on con service_healthy desde Java.
10. CI básico que haga `docker compose build` en cada PR
    para detectar regresiones de build.

================================================================
Sesión 15 de mayo de 2026 (tarde) - Estabilización y calidad
del análisis pedagógico
================================================================

OBJETIVO:
Validar el flujo end-to-end del one-click launcher en una corrida
real y, sobre todo, mejorar la CALIDAD pedagógica de la respuesta
de IA: que el análisis sea didáctico, en español, con títulos
cortos y código refactorizado limpio. Detectamos varios bugs y
limitaciones de qwen2 al probar casos reales (syntax error en
Python, SQL Injection en Java/Kotlin) y los corregimos sin
cambiar el modelo (que sigue siendo qwen2 para no perder el
"todo en CPU + Docker Desktop como único requisito").

=== PROBLEMAS DETECTADOS Y RESUELTOS ===

1) Contenedor de Ollama dockerizado moría con exit code 137
   (OOM-kill) durante el primer pull del modelo qwen2.

   Síntoma: en la primera ejecución de Iniciar.bat, el
   contenedor ollama-1 caía a la mitad del download (~10-13%
   del modelo) y Docker lo reiniciaba en loop. Los servicios
   dependientes (Python, Java, frontend) no llegaban a arrancar
   porque ollama no terminaba de pasar el healthcheck.

   Diagnóstico: `docker compose logs ollama` mostraba el
   server iniciando bien (`Listening on [::]:11434`), runners
   en CPU detectados (`inference compute id=cpu`,
   `total=7.5 GiB`), pero a mitad del pull Linux mataba el
   contenedor por presión de memoria. Docker Desktop tenía
   asignados ~7.5 GiB a la VM de WSL, lo cual está en el
   borde para el pull + verificación del blob de 4.4 GB.

   Fix recomendado al usuario:
     Docker Desktop -> Settings -> Resources -> Memory: 12 GB.
     Apply & Restart.
   Eso eliminó el OOM en el segundo intento y el pull
   completó normalmente. El modelo quedó persistido en el
   volumen `ollama_data`, así que la próxima corrida arranca
   en segundos sin volver a descargar.

   Fix preventivo en el código (Ollama_servicio/Dockerfile):
     RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x ...
   Esto normaliza line endings CRLF -> LF antes del chmod.
   Si en algún momento el .sh se commitea desde un editor
   Windows con CRLF, el kernel Linux falla al interpretar
   "#!/bin/sh\r" y el contenedor sale con exit 255 (otro modo
   común de muerte en setups Windows). Es trivial y barato,
   y blinda al lanzador para PCs nuevas.

2) Override docker-compose.ollama-host.yml (opcional).
   Como plan B durante el debug del punto 1, dejamos un
   archivo `docker-compose.ollama-host.yml` que permite
   correr Ollama en el host en vez de dockerizado, mientras
   el resto del stack sigue en contenedores. Se usa con:
     ollama serve     (en una terminal aparte)
     docker compose -f docker-compose.yml ^
       -f docker-compose.ollama-host.yml up -d ^
       --no-deps microservicio_inferencia_analisis ^
       postgres microservicio_gestion_persistencia ^
       interfaz_usuario
   No es el modo recomendado para el evaluador (rompe el
   one-click), pero queda documentado por si alguien tiene
   GPU y quiere aprovecharla sin pasthrough en Docker.

3) BUG MAYOR: cortocircuito de syntax error sin pasar por LLM.

   Síntoma: el usuario pasó un código Python con `def saludar(nombre)`
   (faltaban los `:`) y la respuesta era:
     - Issue: "SyntaxError: expected ':'" (crítico, línea 1) - OK
     - Explicación: "Hay un error de sintaxis en la línea 1.
                     Corregí este error antes de continuar." - genérico
     - Refactored code: el código sin tocar - inútil

   Causa raíz: en `analyze_with_ollama`, había un cortocircuito
   con `ast.parse()`:
     try:
         ast.parse(code)
     except SyntaxError as e:
         return { ...explicación genérica..., refactored_code: code }
   Es decir, cuando había syntax error NUNCA se consultaba al
   LLM, por lo que no había explicación didáctica ni código
   corregido. Una falla pedagógica grande dado que esos son
   justamente los casos más comunes para un alumno que recién
   empieza.

   Refactor aplicado (Microservicio_inferencia_analisis/app.py):
   - Detección con AST se mantiene, pero ahora SOLO enriquece el
     contexto que se le pasa al LLM (línea exacta + mensaje del
     parser + hint en español según el tipo de error). No
     reemplaza al LLM.
   - SIEMPRE se llama al LLM, tenga o no syntax error.
   - Si el LLM responde, se garantiza por post-proceso que el
     issue crítico del parser aparezca en la lista (el modelo
     a veces lo omite).
   - Si el LLM falla, fallback amable: al menos se reporta el
     syntax error detectado por AST, con un mensaje explicando
     que no se pudo generar la explicación pedagógica.

4) Alucinaciones de qwen2 con terminología cruzada entre lenguajes.

   Síntoma: ante el mismo caso de `expected ':'` en Python, el
   modelo a veces respondía:
     "Falta un punto y coma al final de la declaración"
     "En Python, cada declaración debe finalizar con un ':'"
   El primer mensaje confunde `:` con `;` (terminología de
   Java/C). El segundo generaliza una regla FALSA (solo las
   sentencias que abren bloque terminan con `:`, no todas).
   Es típico de un modelo chico (4 GB) entrenado de forma
   general: responde con texto plausible pero técnicamente
   incorrecto.

   Mejoras al prompt (Microservicio_inferencia_analisis/app.py):
   - Reglas duras al inicio del prompt:
       * "El lenguaje analizado es X. NO MEZCLES sintaxis de
          otros lenguajes."
       * "No inventes reglas gramaticales que no existen."
       * "Sé conciso. Un párrafo enfocado, no tres vagos."
       * "Usa terminología correcta en español: 'sentencia' o
          'instrucción', NO 'afirmación' (mala traducción de
          'statement')."
   - Few-shot example: se le muestra al modelo un ejemplo
     concreto de input (código con `def saludar(nombre)`) +
     output JSON ideal, para que aprenda por imitación qué
     formato y nivel de detalle queremos. En modelos chicos
     esto mueve mucho la aguja.
   - Numeración de líneas en el código que se le pasa: el
     modelo se ubica mejor y cita líneas con precisión.
   - Hint estructurado según el mensaje del parser:
       expected ':'           -> hint en español aclarando que
                                 Python usa ':' para abrir
                                 bloques, no ';' para cerrar.
       expected indented block -> hint sobre indentación.
       unexpected indent       -> hint sobre sangría mezclada.
       eol while scanning ...  -> hint sobre string sin cerrar.
       (etc.)
     El hint se inyecta en el prompt como "Hint (use this, do
     not contradict it)" y previene buena parte de las
     alucinaciones de terminología.

5) BUG MENOR: refactored_code venía envuelto en fences
   ```python ... ``` (markdown).

   Síntoma: el panel "Código refactorizado" del frontend
   mostraba la primera línea con ```python y la última con
   ```, lo cual ensucia visualmente porque el lenguaje ya se
   sabe (el usuario lo eligió en el select).

   Fix:
   - Regla #7 del prompt: "refactored_code MUST be RAW source
     code only. Do NOT wrap with triple backticks. No language
     tag. Just the code itself."
   - Post-proceso defensivo `_strip_code_fences(code)`: si
     pese a la regla el modelo igual envuelve, se quitan los
     fences automáticamente (soporta ```, ```py, ```python,
     mayúsculas y minúsculas). Modelos chicos a veces ignoran
     parte del prompt, así que esta red de seguridad evita
     que el bug llegue al frontend.

6) BUG DE UX: los títulos de los cards de issues eran el
   mensaje completo truncado a 80 chars, lo que se veía como
   "Inyección SQL: el string concatenado con 'nombre' podría
   ser manipulado por u..." (idéntico al texto de descripción
   y cortado a la mitad).

   Esto pasaba porque el contrato anterior solo tenía
   `message` y el mapper del frontend usaba el mismo string
   para `title` y `description`.

   Solución (en 3 capas coordinadas):
   a) Python (app.py): se agregó campo opcional `title` al
      modelo Issue, y se le pide al LLM en el prompt como
      etiqueta corta MAYÚSCULAS de 2-5 palabras:
        "INYECCION SQL", "FALTA DE DOS PUNTOS",
        "CONTRASENA HARDCODEADA", etc.
      Si el modelo no manda title o manda algo largo, hay
      fallback en `_normalize_title` que deriva las primeras
      5 palabras del mensaje en mayúsculas.
   b) Java (IssueDto.java): se agregó campo `title` con
      getter/setter + @JsonInclude(NON_NULL). Jackson lo
      deserializa solo desde el Python y lo re-serializa al
      frontend. Se mantuvo el constructor de 3 args original
      por compatibilidad, y se sumó uno de 4 args con title.
      El response_json de analysis_history persiste el title
      automáticamente porque la tabla almacena el JSON crudo.
   c) Frontend (auditMapper.js): se agregó `pickIssueTitle`
      con jerarquía de fallback:
        1. Si el backend trae `title` corto (≤6 palabras,
           ≤50 chars), se respeta tal cual.
        2. Si no, `deriveTitleFromMessage` matchea el mensaje
           contra una tabla de TITLE_PATTERNS (regex):
             SQL injection -> "INYECCION SQL"
             command injection -> "INYECCION DE COMANDOS"
             path traversal -> "PATH TRAVERSAL"
             xss -> "XSS"
             hardcoded password -> "CONTRASENA HARDCODEADA"
             weak crypto -> "CRIPTOGRAFIA DEBIL"
             sin manejo de errores / try-catch missing
                              -> "FALTA MANEJO DE ERRORES"
             println / print / system.out.println
                              -> "LOG EN PRODUCCION"
             syntax error / expected ':' / dos puntos
                              -> "ERROR DE SINTAXIS" /
                                 "FALTA DE DOS PUNTOS"
             indentación      -> "ERROR DE INDENTACION"
             variable no definida
                              -> "VARIABLE NO DEFINIDA"
             off-by-one       -> "OFF-BY-ONE"
             TODO/FIXME       -> "TODO/FIXME PENDIENTE"
        3. Como último recurso, primeras 5 palabras del
           mensaje en mayúsculas, sin signos.
        4. Si no hay mensaje, "HALLAZGO DETECTADO".
      Resultado: el card SIEMPRE tiene un título corto y
      categorizado, sin depender de que el LLM siga el
      contrato a rajatabla. Si después subimos a un modelo
      mejor que sí mande title, la regla 1 lo respeta y el
      sistema mejora gratis.

=== ARCHIVOS MODIFICADOS ===

- Microservicio_inferencia_analisis/app.py
    * Reescritura completa de `analyze_with_ollama` para no
      cortocircuitar en syntax errors.
    * Nuevas funciones auxiliares:
        _detect_python_syntax_error(code) -> dict con
            line/col/message/hint, o None si compila.
        _hint_for_python_syntax(parser_msg) -> hint en
            español para los mensajes más comunes del parser.
        _number_lines(code) -> código con prefijo "N | ..."
            por línea, para que el modelo se ubique mejor.
        _strip_code_fences(code) -> quita ```python ... ```
            si el modelo igual los puso.
        _normalize_title(raw_title, fallback_message) ->
            título corto en mayúsculas (≤6 palabras), con
            derivación automática desde el mensaje si el
            modelo no entregó title.
        _safe_issue(raw_dict) -> construye Issue tolerando
            campos faltantes/mal tipados del LLM (line como
            string, severity inválida, etc.).
        _build_prompt(code, language, mode, syntax_error)
            -> prompt enriquecido con reglas duras, schema
            con title, few-shot example para Python con
            syntax error, hint estructurado, y código
            numerado.
    * Nuevo campo `title: Optional[str]` en `class Issue`.
    * Timeout subido a 120s (antes 60s) para no cortar al
      modelo cuando arranca en frío.
    * El endpoint /analyze ahora siempre devuelve issues
      ricos en español, incluso si el LLM falla (fallback
      tiene tono pedagógico y deriva titles desde patrones).

- Microservicio_gestion_persistencia/.../IssueDto.java
    * Nuevo campo private String title.
    * @JsonInclude(NON_NULL) a nivel clase.
    * Constructor adicional de 4 args (line, message,
      severity, title). El de 3 args se mantiene para no
      romper código existente.
    * Getters/setters.

- Ollama_servicio/Dockerfile
    * `sed -i 's/\r$//' /entrypoint.sh` antes del chmod,
      como fix preventivo de line endings.

- Interfaz_usuario/src/utils/auditMapper.js
    * Nueva constante TITLE_PATTERNS con ~14 regex
      mapeadas a etiquetas cortas.
    * Nueva función deriveTitleFromMessage(message) que
      aplica los patrones y, como último fallback, recorta
      a 5 palabras en mayúsculas.
    * Nueva función pickIssueTitle(rawTitle, message) con
      la jerarquía descrita arriba.
    * mapIssue() ahora usa pickIssueTitle en lugar de
      duplicar el mensaje completo como título.
    * extractTitleFromMessage queda como helper viejo SOLO
      para `buildTitle` (título global de la auditoría
      completa, distinto del título del card por issue).

=== ARCHIVOS NUEVOS ===

- docker-compose.ollama-host.yml (opcional)
    Override para correr Ollama en el host. Documentado con
    los comandos exactos al inicio del archivo. No se invoca
    desde Iniciar.bat; queda como herramienta de debug.

=== CASOS PEDAGÓGICOS VALIDADOS ===

Después de aplicar todo lo anterior, se validaron desde el
frontend tres casos pedagógicos. Todos arrancaron desde
Iniciar.bat con el stack completo dockerizado.

1) Python - SyntaxError (falta `:` en def).
     def saludar(nombre)
         print("Hola, " + nombre)
     saludar("Mauro")
   Resultado en el frontend:
     - Issue crítico, línea 1, título "ERROR DE SINTAXIS"
       o "FALTA DE DOS PUNTOS".
     - Descripción cita el carácter ':' (no ';') y la línea
       donde falta.
     - Explicación pedagógica menciona que `def`, `if`,
       `for`, `while`, `class` abren bloques que terminan
       en ':', y aclara que Python NO usa ';'.
     - Refactored code: igual al original pero con
       `def saludar(nombre):`, sin fences de markdown.

2) Python - SQL Injection con sqlite3.
     query = "SELECT * FROM users WHERE username = '"
              + nombre + "'"
     cursor.execute(query)
   Resultado:
     - Issue crítico, título "INYECCION SQL", línea correcta.
     - Issue secundario "FALTA MANEJO DE ERRORES" (warning).
     - Refactored code usa cursor.execute(sql, (nombre,))
       con placeholder `?`.

3) Java - SQL Injection con Statement + System.out.println.
     String sql = "SELECT * FROM usuarios WHERE nombre = '"
                  + nombre + "'";
     Statement st = conn.createStatement();
     System.out.println("Ejecutando: " + sql);
   Resultado:
     - Issue crítico "INYECCION SQL" (línea de la
       concatenación).
     - Issue advertencia o sugerencia "LOG EN PRODUCCION"
       por System.out.println.
     - Refactored code usa PreparedStatement con setString
       y reemplaza el println.

4) Kotlin - SQL Injection + hardcoded password.
     val conn = DriverManager.getConnection(url,
                  "admin", "admin123")
     val query = "SELECT email FROM usuarios
                  WHERE nombre = '$nombre'"
   Resultado:
     - "INYECCION SQL" (crítico).
     - "CONTRASENA HARDCODEADA" (crítico o warning).
     - "LOG EN PRODUCCION" (sugerencia).
     - Refactored con PreparedStatement y credenciales
       sacadas a System.getenv("DB_PASSWORD").

=== LECCIONES APRENDIDAS HOY ===

- Modelos LLM chicos (qwen2 ~4 GB) son MUY sensibles al
  prompt: few-shot + reglas explícitas + hints estructurados
  cambian drásticamente la calidad sin necesidad de subir
  de modelo.
- El error 137 en contenedores Docker casi siempre es
  OOM-kill; subir la RAM asignada a Docker Desktop suele
  resolver. El error 255, en cambio, suele ser CRLF en
  scripts shell traídos desde Windows.
- Cuando se trabaja con LLM, NUNCA cortocircuitear flujos
  pedagógicos: la IA es justamente lo que aporta el valor
  educativo. Usar las herramientas nativas (AST, linters)
  para ENRIQUECER el contexto, no para reemplazar al modelo.
- La defensa en profundidad funciona también para LLMs:
  pedir algo en el prompt + post-procesar la respuesta
  + tener heurísticos en el frontend, en ese orden, hace
  que la UI sea estable aun con respuestas imperfectas
  del modelo.
- Separar "title corto categorizable" de "descripción
  pedagógica larga" mejora MUCHO la legibilidad del
  resultado, y permite filtrar/agrupar issues en UI futura.

=== PRÓXIMOS PASOS ===

CORTO PLAZO (para cerrar el TP):
1. Tomar screenshots actualizados del flujo con los cards
   de issues con título corto y refactor sin fences, para
   el PDF de entrega.
2. Generar la sección "Diseño de Base de Datos" del PDF
   con el DER de users + analysis_history (incluir que el
   response_json ahora también persiste el campo `title`
   por issue, sin cambios de esquema).
3. Exportar la API de Swagger y/o una colección de Postman
   con los casos pedagógicos validados, para anexar.
4. Diagrama de arquitectura final: 5 contenedores
   (postgres, ollama, python, java, frontend) + 2 volúmenes
   (postgres_data, ollama_data), flechas de red entre
   servicios. Reusable para el PDF.

MEDIANO PLAZO (si sobra tiempo, mejoras visibles):
5. Probar `qwen2.5-coder:7b` como upgrade del modelo
   (~4.7 GB, mismo peso que qwen2 pero específicamente
   entrenado para código). Es un drop-in replacement:
   basta cambiar OLLAMA_MODEL en docker-compose.yml.
   Esperamos mejoras notorias en detección de
   vulnerabilidades y en refactors propuestos.
6. Sumar más patrones a TITLE_PATTERNS según los casos
   pedagógicos que se quieran demostrar (ej. concurrencia,
   leaks de memoria, null safety en Kotlin, optionals
   mal usados, etc.).
7. Healthcheck propio del microservicio Python en compose
   y pasar el depends_on de Java a service_healthy.
8. Detectar y reportar mojibake / encoding raro en
   refactored_code (red flag si el modelo devuelve UTF-8
   mal escapado).

LARGO PLAZO (post-TP):
9. Migrar el JWT a httpOnly cookie en lugar de
   localStorage para mitigar XSS.
10. Tests automáticos:
    - pytest del Python service para _strip_code_fences,
      _hint_for_python_syntax, _normalize_title.
    - Vitest del frontend para pickIssueTitle y
      deriveTitleFromMessage (los TITLE_PATTERNS son
      perfectos para tests parametrizados).
    - MockMvc del Java service para los endpoints
      protegidos.
11. CI básico (GitHub Actions) corriendo los tests y
    `docker compose build` en cada PR.
12. Aceptar archivos enteros (no solo fragmentos) con
    chunking automático antes de mandar al LLM, para
    poder analizar repos pequeños.
>>>>>>> Stashed changes
