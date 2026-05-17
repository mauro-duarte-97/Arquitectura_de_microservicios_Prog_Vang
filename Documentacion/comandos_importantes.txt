================================================================
Comandos de lanzamiento - Plataforma de Auditoria de Codigo
================================================================

# ----------------------------------------------------------------
# 1) Base de datos PostgreSQL (Docker)
# ----------------------------------------------------------------
# Levanta SOLO Postgres (suficiente para correr Java en local nativo):
=======
Hay DOS modos de uso. Eleg\u00ed seg\u00fan lo que necesit\u00e9s:

  Modo A - "Todo en Docker"  -> ideal para demos / probar el deployment.
  Modo B - "Hibrido (DB Docker + Java/Python locales)" -> ideal para programar.

Ambos modos llegan al mismo resultado funcional; cambia la velocidad de
iteracion y el aislamiento.


################################################################
# MODO A - TODO EN DOCKER (un solo comando levanta los 3 servicios)
################################################################

# Construye y levanta Postgres + Java + Python juntos en contenedores:
docker compose up --build

# Levantar en background (-d = detached):
docker compose up -d --build

# Ver logs en vivo de todo el stack:
docker compose logs -f

# Ver logs de un servicio especifico:
docker compose logs -f microservicio_gestion_persistencia
docker compose logs -f microservicio_inferencia_analisis
docker compose logs -f postgres

# Bajar todo:
docker compose down

# Bajar todo Y BORRAR los datos de Postgres (cuidado, irreversible):
docker compose down -v

# Reconstruir imagenes sin levantar (despues de cambios en Dockerfile):
docker compose build

# Cuando us\u00e1s Modo A:
#   - El Java se conecta a postgres por hostname "postgres" (no localhost).
#   - El Java llama al Python por "http://microservicio_inferencia_analisis:5000".
#   - Estos hostnames los resuelve Docker autom\u00e1ticamente entre contenedores.
#   - Los puertos quedan expuestos en tu Windows: 5432, 8080 y 5000.


################################################################
# MODO B - HIBRIDO (Postgres en Docker, Java y Python nativos)
################################################################

# Ideal para desarrollar: rebuild instantaneo, hot reload de Python con
# uvicorn --reload, logs limpios en consolas separadas.

# ----------------------------------------------------------------
# B.1) Base de datos PostgreSQL (solo el contenedor de Postgres)
# ----------------------------------------------------------------
# En la raiz del repo (donde esta docker-compose.yml):
>>>>>>> Stashed changes
docker compose up -d postgres

# Ver logs en vivo:
docker compose logs -f postgres

<<<<<<< Updated upstream
# Apagar:
docker compose down

# Resetear la DB (BORRA los datos):
docker compose down -v


# ----------------------------------------------------------------
# 2) Microservicio Python (FastAPI + uvicorn)
=======
# Apagar la DB (sin borrar datos):
docker compose stop postgres

# ----------------------------------------------------------------
# B.2) Microservicio Python (FastAPI + uvicorn)
>>>>>>> Stashed changes
# ----------------------------------------------------------------
# Activar el entorno virtual (Microservicio_inferencia_analisis\venv)
# y, parado en Microservicio_inferencia_analisis, ejecutar:
uvicorn app:app --reload --host 127.0.0.1 --port 5000

<<<<<<< Updated upstream

# ----------------------------------------------------------------
# 3) Microservicio Java (Spring Boot 3.2.5 + Java 21)
=======
# ----------------------------------------------------------------
# B.3) Microservicio Java (Spring Boot 3.2.5 + Java 21)
>>>>>>> Stashed changes
# ----------------------------------------------------------------
# Parado en Microservicio_gestion_persistencia:
.\mvnw.cmd spring-boot:run

# Otros comandos utiles del wrapper:
.\mvnw.cmd clean package        # compilar y empaquetar el .jar
.\mvnw.cmd test                 # correr tests
.\mvnw.cmd dependency:tree      # ver el arbol de dependencias

<<<<<<< Updated upstream

# ----------------------------------------------------------------
# 4) Variables de entorno (opcionales; tienen defaults en dev)
# ----------------------------------------------------------------
=======
# Cuando us\u00e1s Modo B:
#   - El Java se conecta a postgres en localhost:5432 (mapeado por Docker).
#   - El Java llama al Python en http://localhost:5000 (nativo).
#   - Spring Boot relee cambios al instante; Python recarga con --reload.
#   - Necesitas tener 3 consolas abiertas (Postgres en background no cuenta).


################################################################
# VARIABLES DE ENTORNO (opcionales; tienen defaults para dev)
################################################################

>>>>>>> Stashed changes
# POSTGRES_HOST          (default: localhost)
# POSTGRES_PORT          (default: 5432)
# POSTGRES_DB            (default: auditoria)
# POSTGRES_USER          (default: auditoria)
# POSTGRES_PASSWORD      (default: auditoria)
# JWT_SECRET             (default solo para DEV, NO usar en produccion)
# JWT_EXPIRATION_MINUTES (default: 60)
# PYTHON_SERVICE_URL     (default: http://localhost:5000)
<<<<<<< Updated upstream


# ----------------------------------------------------------------
# 5) Levantar TODO con docker-compose (opcional)
# ----------------------------------------------------------------
# Construye y levanta Postgres + Java + Python juntos:
docker compose up --build

# Solo si queres reconstruir las imagenes despues de cambios:
docker compose build


# ----------------------------------------------------------------
# 6) Verificacion rapida (PowerShell)
# ----------------------------------------------------------------
# Ver puertos en escucha:
Get-NetTCPConnection -State Listen -LocalPort 5000,5432,8080,11434 | Format-Table -AutoSize


# ================================================================
# Endpoints del microservicio Java (http://localhost:8080)
# ================================================================
#
# Publicos (no requieren JWT):
=======
# CORS_ALLOWED_ORIGINS   (default: http://localhost:3000,http://localhost:5173)


################################################################
# VERIFICACION RAPIDA (PowerShell)
################################################################

# Ver puertos en escucha (postgres=5432, java=8080, python=5000, ollama=11434):
Get-NetTCPConnection -State Listen -LocalPort 5000,5432,8080,11434 | Format-Table -AutoSize

# Smoke tests rapidos:
Invoke-RestMethod http://localhost:8080/test
Invoke-RestMethod http://localhost:8080/actuator/health
Invoke-RestMethod http://localhost:5000/test


################################################################
# ENDPOINTS DEL MICROSERVICIO JAVA (http://localhost:8080)
################################################################

# --- Publicos (no requieren JWT) ---
>>>>>>> Stashed changes
#   GET  /test
#   GET  /api/v1/health
#   POST /api/v1/auth/register     body: { email, username, password }
#   POST /api/v1/auth/login        body: { email, password }
#
<<<<<<< Updated upstream
# Protegidos (requieren header Authorization: Bearer <token>):
=======
# --- Protegidos (requieren header Authorization: Bearer <token>) ---
>>>>>>> Stashed changes
#   GET  /api/v1/auth/me
#   POST /api/v1/analyze           body: { code, language?, mode? }
#   GET  /api/v1/history           query: ?page=0&size=20
#   GET  /api/v1/history/{id}
#
<<<<<<< Updated upstream
# Swagger UI:
#   http://localhost:8080/swagger-ui.html


# ================================================================
# Flujo de prueba en Postman
# ================================================================
=======
# --- Observabilidad (Spring Boot Actuator, publicos en dev) ---
#   GET  /actuator/health          status global + datasource
#   GET  /actuator/info            metadatos de la app
#   GET  /actuator/metrics         lista de metricas disponibles
#   GET  /actuator/metrics/{name}  ej: /actuator/metrics/jvm.memory.used
#
# --- Documentacion automatica ---
#   GET  /swagger-ui.html          Swagger UI generado por springdoc


################################################################
# FLUJO DE PRUEBA EN POSTMAN
################################################################

>>>>>>> Stashed changes
# 1) POST /api/v1/auth/register
#    {
#      "email": "test@example.com",
#      "username": "Test User",
#      "password": "password123"
#    }
<<<<<<< Updated upstream
#    -> devuelve { accessToken, ... }
#
# 2) Copiar accessToken y pegarlo en la pestaña Authorization de Postman:
#    Type: Bearer Token
=======
#    -> devuelve { accessToken, tokenType, expiresInMinutes, user }
#
# 2) Copiar accessToken y pegarlo en la pestana Authorization de Postman:
#    Type:  Bearer Token
>>>>>>> Stashed changes
#    Token: <accessToken>
#
# 3) POST /api/v1/analyze
#    {
#      "code": "print('hola')",
#      "language": "python",
#      "mode": "Senior Dev"
#    }
#

# 4) GET /api/v1/history  -> ves el analisis recien guardado.


################################################################
# RECOMENDACION RAPIDA DE QUE MODO USAR
################################################################
#
#   Desarrollando codigo Java/Python ...... Modo B
#   Demo / presentacion ................... Modo A
#   Validar que el Dockerfile funciona .... Modo A
#   Debuggear con breakpoints en IDE ...... Modo B
#   Primer arranque del repo (smoke test).. Modo A
