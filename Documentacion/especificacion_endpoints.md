# Especificación de Endpoints (API REST)

Este documento detalla los endpoints expuestos por el microservicio de gestión y persistencia (Java/Spring Boot), que actúa como el orquestador principal del sistema y la puerta de entrada para el frontend.

Todas las peticiones a la API (excepto las de autenticación pública) deben incluir el encabezado de autorización:
`Authorization: Bearer <token_jwt>`

---

## 1. Autenticación (`AuthController`)

### 1.1. Registro de Usuario
- **Ruta:** `POST /api/v1/auth/register`
- **Descripción:** Crea un nuevo usuario en el sistema. La contraseña se encripta con BCrypt antes de persistirse.
- **Acceso:** Público
- **Cuerpo de la Petición (JSON):**
  ```json
  {
    "email": "estudiante@unlam.edu.ar",
    "username": "estudiante1",
    "password": "PasswordSegura123"
  }
  ```
- **Respuesta Esperada (201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
  ```
- **Posibles Errores:** 
  - `400 Bad Request`: Si el email ya está registrado o el formato es inválido.

### 1.2. Inicio de Sesión
- **Ruta:** `POST /api/v1/auth/login`
- **Descripción:** Autentica a un usuario existente y devuelve un token JWT con validez de 60 minutos.
- **Acceso:** Público
- **Cuerpo de la Petición (JSON):**
  ```json
  {
    "email": "estudiante@unlam.edu.ar",
    "password": "PasswordSegura123"
  }
  ```
- **Respuesta Esperada (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
  ```
- **Posibles Errores:**
  - `401 Unauthorized`: Credenciales incorrectas.

### 1.3. Datos del Usuario Actual
- **Ruta:** `GET /api/v1/auth/me`
- **Descripción:** Devuelve la información del usuario autenticado actualmente usando el token JWT provisto.
- **Acceso:** Protegido (Requiere JWT)
- **Respuesta Esperada (200 OK):**
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "estudiante@unlam.edu.ar",
    "username": "estudiante1",
    "role": "USER"
  }
  ```
- **Posibles Errores:**
  - `401 Unauthorized`: Token faltante, expirado o inválido.

---

## 2. Análisis de Código (`AnalyzeController`)

### 2.1. Auditar Código
- **Ruta:** `POST /api/v1/analyze`
- **Descripción:** Recibe un fragmento de código, lo envía al microservicio de inferencia (Python) para su evaluación con IA, guarda el resultado en el historial y devuelve el feedback.
- **Acceso:** Protegido (Requiere JWT)
- **Cuerpo de la Petición (JSON):**
  ```json
  {
    "code": "def suma(a,b):\nreturn a+b",
    "language": "python",
    "mode": "Senior Dev" 
  }
  ```
- **Respuesta Esperada (200 OK):**
  ```json
  {
    "historyId": "987e6543-e21b-34d5-c678-426614174111",
    "issues": [
      {
        "line": 2,
        "title": "INDENTACIÓN FALTANTE",
        "message": "Falta indentación en el bloque de la función.",
        "severity": "critical"
      }
    ],
    "explanation": "En Python, los bloques de código se definen por indentación...",
    "refactoredCode": "def suma(a, b):\n    return a + b"
  }
  ```
- **Posibles Errores:**
  - `401 Unauthorized`: Si el JWT es inválido.
  - `400 Bad Request`: Si el cuerpo de la petición no tiene el formato correcto (ej. código vacío).
  - `500/503`: Si el servicio de inferencia Python o el LLM no están disponibles (aunque existe un fallback).

---

## 3. Historial (`HistoryController`)

### 3.1. Listar Historial (Paginado)
- **Ruta:** `GET /api/v1/history`
- **Descripción:** Obtiene la lista paginada de análisis previos realizados por el usuario autenticado, ordenados por fecha de creación descendente.
- **Acceso:** Protegido (Requiere JWT)
- **Parámetros Query (Opcionales):**
  - `page`: Número de página (default: 0).
  - `size`: Elementos por página (default: 20).
  - `sort`: Campo de ordenamiento (default: `createdAt,desc`).
- **Respuesta Esperada (200 OK):** Devuelve un objeto `Page` de Spring Data con contenido (lista de metadatos de análisis), número de página actual, total de elementos, etc.

### 3.2. Detalle de Análisis
- **Ruta:** `GET /api/v1/history/{id}`
- **Descripción:** Obtiene los detalles completos de un análisis previo específico (incluyendo el código original y el JSON de respuesta de la IA).
- **Acceso:** Protegido (Requiere JWT). Solo permite acceder a análisis propios.
- **Parámetros Path:**
  - `id`: UUID del análisis (historyId).
- **Respuesta Esperada (200 OK):**
  ```json
  {
    "id": "987e6543-e21b-34d5-c678-426614174111",
    "language": "python",
    "mode": "Senior Dev",
    "code": "...",
    "responseJson": "{...}",
    "createdAt": "2026-05-17T15:30:00Z"
  }
  ```
- **Posibles Errores:**
  - `404 Not Found`: El análisis no existe.
  - `403 Forbidden` / `404 Not Found`: El análisis existe pero pertenece a otro usuario.

---

## 4. Endpoints de Utilidad / Salud

- **`GET /test` y `GET /api/v1/health`**: Endpoints de smoke test para verificar que el servidor de Spring Boot levantó correctamente. No requieren autenticación.
- **`GET /swagger-ui/index.html`**: Interfaz visual de OpenAPI (Swagger) generada automáticamente, donde se puede probar cada endpoint documentado (ideal para adjuntar capturas de pantalla en el informe final).
