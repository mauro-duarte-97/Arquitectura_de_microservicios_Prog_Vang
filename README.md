# Code Audit AI

Plataforma de auditoría de código basada en microservicios con análisis
asistido por IA. TP de Programación de Vanguardia.

## Arquitectura

```
  Browser → Frontend (React + nginx)  :5173
              │
              │   fetch  /api/v1/*
              ▼
          Backend Java (Spring Boot)  :8080
              │            │
              │ JPA        │ HTTP
              ▼            ▼
         Postgres     Backend Python (FastAPI)  :5000
            :5432           │
                            │ HTTP
                            ▼
                        Ollama  :11434   (modelo qwen2.5-coder:7b)
```

Todo corre como contenedores Docker orquestados por `docker-compose.yml`.

## Cómo correr el sistema

### Requisito previo (una sola vez)

Tener **Docker Desktop** instalado y corriendo:
<https://www.docker.com/products/docker-desktop>

> No hace falta instalar Java, Python, PostgreSQL, Node ni Ollama por
> separado: todo está embebido en los contenedores.

### Arranque del sistema

Doble-click en **`Iniciar.bat`** . Ejecutá **`Aplicar_iconos.bat`** una vez si
querés crear o actualizar `Iniciar.lnk`.

Lo que hace el script:

1. Verifica que Docker Desktop esté corriendo.
2. Levanta los 5 contenedores en background:
   - `postgres` (base de datos)
   - `ollama` (servidor de IA, descarga el modelo qwen2.5-coder:7b la primera vez)
   - `microservicio_inferencia_analisis` (Python / FastAPI)
   - `microservicio_gestion_persistencia` (Java / Spring Boot)
   - `interfaz_usuario` (React buildeado, servido por nginx)
3. Espera a que el backend Java y el frontend respondan.
4. Abre el navegador en <http://localhost:5173>.

**La primera vez tarda 5-15 minutos** porque:
- Descarga las imágenes base de Docker (~1.5 GB en total).
- Buildea las imágenes de cada servicio.
- Descarga el modelo qwen2.5-coder:7b dentro del contenedor Ollama (~4.7 GB).

Las siguientes veces arranca en 30-60 segundos.

### Detener el sistema

Doble-click en **`Detener.bat`**. Los datos (usuarios y auditorías)
quedan persistidos en volúmenes Docker; al volver a iniciar no se pierde
nada.

## URLs útiles

| URL | Qué es |
|---|---|
| http://localhost:5173 | **Frontend** (la app) |
| http://localhost:8080/swagger-ui/index.html | Swagger UI con todos los endpoints del backend Java |
| http://localhost:8080/test | Healthcheck del backend Java |
| http://localhost:5000/test | Healthcheck del microservicio Python (incluye estado de Ollama) |

> Abrir `http://localhost:8080/` (sin path) devuelve **403**: es
> comportamiento esperado de Spring Security. Las rutas protegidas
> exigen JWT.

## Comandos útiles

```bash
# Ver logs en vivo de un servicio específico
docker compose logs -f microservicio_gestion_persistencia
docker compose logs -f ollama

# Ver estado de los contenedores
docker compose ps

# Reiniciar un servicio (sin tocar el resto)
docker compose restart microservicio_inferencia_analisis

# Rebuild forzado de un servicio
docker compose up -d --build interfaz_usuario

# Borrar TODO incluida la base de datos (cuidado, perdés usuarios e historial)
docker compose down -v
```

## Estructura del repo

```
.
├── Iniciar.bat                          # Arranca todo
├── Detener.bat                          # Para todo
├── docker-compose.yml                   # Orquestación
├── Interfaz_usuario/                    # Frontend React + Vite
│   ├── Dockerfile                       # Build estático + nginx
│   ├── nginx.conf
│   └── src/
├── Microservicio_gestion_persistencia/  # Backend Java / Spring Boot
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
├── Microservicio_inferencia_analisis/   # Backend Python / FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py
├── Ollama_servicio/                     # Imagen de Ollama con modelo pre-pulled
│   ├── Dockerfile
│   └── entrypoint.sh
└── Documentacion/
    ├── bitacora.txt                     # Historial de decisiones técnicas
    └── ...
```

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React + Vite + Tailwind + Monaco Editor | React 18, Vite 5 |
| Backend Java | Spring Boot + Spring Security + JPA + Flyway | Spring Boot 3.2.5, Java 21 |
| Backend Python | FastAPI + uvicorn | FastAPI 0.104 |
| Base de datos | PostgreSQL | 16 |
| IA local | Ollama + qwen2.5-coder:7b | qwen2.5-coder:7b (~4.7 GB) |
| Auth | JWT (jjwt 0.12.6) | — |

## Modo desarrollo (para iterar sobre el frontend con hot reload)

Si estás modificando el frontend y querés ver los cambios al instante:

```bash
# Levantar todo MENOS el frontend
docker compose up -d postgres ollama microservicio_inferencia_analisis microservicio_gestion_persistencia

# Frontend en modo dev (con HMR)
cd Interfaz_usuario
npm install
npm run dev
```

La UI queda en <http://localhost:5173> igual, pero ahora con recarga al
guardar archivos. Mirá `Interfaz_usuario/README.md` para más detalles.
