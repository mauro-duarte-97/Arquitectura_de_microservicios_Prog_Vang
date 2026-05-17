# Code Audit AI – Frontend

Frontend del TP de Programación de Vanguardia conectado al microservicio Java
(`Microservicio_gestion_persistencia`) y, a través de él, al microservicio
Python (`Microservicio_inferencia_analisis`).

## Stack

- React 18 + Vite 5
- React Router 6
- Tailwind CSS 3
- Monaco Editor (`@monaco-editor/react`)
- `lucide-react` para iconos

## Configuración

Las variables de entorno se leen al hacer `vite dev`/`vite build`. El único
valor relevante es la URL del backend Java:

```bash
# .env (no se comitea)
VITE_API_BASE_URL=http://localhost:8080
```

Si no se define, se asume `http://localhost:8080`. Hay un `.env.example` con
el valor por defecto.

## Cómo correrlo

<<<<<<< Updated upstream
> **Importante:** `docker compose up` se queda corriendo en primer plano (es
> un servidor, no devuelve la consola). Hay que usar **dos terminales** o
> levantar Docker en background con `-d`.

### Opción A — Dos terminales (recomendado para ver logs en vivo)

```bash
# Terminal 1 (raíz del repo): backend
docker compose up --build

# Terminal 2 (raíz del repo): frontend
cd Interfaz_usuario
npm install
npm run dev          # abre http://localhost:5173
```

### Opción B — Backend en background

```bash
# Terminal única (raíz del repo)
docker compose up -d --build
cd Interfaz_usuario
npm install
npm run dev
```

Para parar el backend más tarde: `docker compose down`.

### Cómo verificar que los servicios están vivos

| Servicio | URL de chequeo | Qué esperar |
|---|---|---|
| Java | http://localhost:8080/test | 200 con texto "Java OK" |
| Python | http://localhost:5000/test | 200 con JSON `{status, ollama_available, ...}` |
| Swagger | http://localhost:8080/swagger-ui/index.html | Documentación de todos los endpoints |
| Frontend | http://localhost:5173 | Pantalla de login |

> **No te asustes si `http://localhost:8080` te devuelve HTTP 403**: esa ruta
> está protegida por Spring Security y exige JWT. Es comportamiento esperado,
> no un error. Solo las rutas listadas arriba son públicas.

El backend tiene CORS habilitado para `http://localhost:5173` y
`http://localhost:3000` (ver `app.cors.allowed-origins` en `application.properties`
del microservicio Java).
=======
### Para usar la app (no para modificarla)

Doble-click en `Iniciar.bat` en la raíz del repo. Ver el README de la raíz.

### Para desarrollar (hot reload de Vite)

Cuando estás iterando sobre el código, conviene levantar el backend en
Docker y el frontend con `npm run dev` para tener HMR:

```bash
# Terminal 1 — backend en Docker (raíz del repo)
docker compose up -d postgres ollama microservicio_inferencia_analisis microservicio_gestion_persistencia

# Terminal 2 — frontend en modo dev
cd Interfaz_usuario
npm install
npm run dev          # http://localhost:5173 con HMR
```

> El servicio `interfaz_usuario` de Docker queda **detenido** durante el
> desarrollo. Si lo dejás corriendo, vas a tener dos cosas escuchando
> en 5173 (la del contenedor pisa la de Vite o viceversa según orden).
> Por eso lo excluimos explícitamente del `docker compose up` de arriba.

### Cómo verificar que los servicios están vivos

| Servicio | URL | Qué esperar |
|---|---|---|
| Java | http://localhost:8080/test | 200 con texto "Java OK" |
| Python | http://localhost:5000/test | JSON `{status, ollama_available, ...}` |
| Swagger | http://localhost:8080/swagger-ui/index.html | Documentación de endpoints |
| Frontend (Docker) | http://localhost:5173 | Pantalla de login |

> Si `http://localhost:8080/` devuelve **403**, es **normal**. Spring
> Security exige JWT en cualquier ruta no listada como pública.

CORS está habilitado para `http://localhost:5173` y `http://localhost:3000`
(ver `app.cors.allowed-origins` en `application.properties` del microservicio
Java).
>>>>>>> Stashed changes

## Endpoints consumidos

| Acción | Método | Endpoint |
|---|---|---|
| Registro | `POST` | `/api/v1/auth/register` |
| Login | `POST` | `/api/v1/auth/login` |
| Usuario actual | `GET` | `/api/v1/auth/me` |
| Analizar código | `POST` | `/api/v1/analyze` |
| Historial paginado | `GET` | `/api/v1/history?page=&size=` |
| Detalle de auditoría | `GET` | `/api/v1/history/{id}` |

El JWT se guarda en `localStorage` bajo la key `code-audit-ai.token` y se
adjunta como `Authorization: Bearer <token>` en cada petición autenticada.

## Estructura

```
src/
├── App.jsx                       # router + protección de rutas
├── main.jsx                      # bootstrap con <AuthProvider>
├── components/
│   ├── AuditTable.jsx
│   ├── CodeEditor.jsx
│   ├── IssueCard.jsx
│   ├── LoadingAudit.jsx
│   ├── MetricCard.jsx
│   ├── ProtectedRoute.jsx        # redirige a /login si no hay token
│   └── SeverityBadge.jsx
├── config/
│   └── auditConfig.js            # MAX_CODE_CHARS, lenguajes soportados
├── context/
│   └── AuthContext.jsx           # estado global de usuario + token
├── layouts/
│   └── AppLayout.jsx
├── pages/
│   ├── AuditResult.jsx
│   ├── Dashboard.jsx
│   ├── History.jsx
│   ├── Login.jsx
│   ├── NewAudit.jsx
│   ├── Register.jsx
│   └── Settings.jsx
├── services/
│   ├── apiClient.js              # fetch con Bearer + manejo de errores
│   └── auditApi.js               # llamadas concretas al backend
└── utils/
    ├── auditMapper.js            # backend DTO ⇒ modelo del frontend
    └── severity.js
```

## Límites de uso

- El editor de Monaco está acotado a **2000 caracteres** (`MAX_CODE_CHARS` en
  `src/config/auditConfig.js`). El microservicio Python usa un modelo gratuito
  vía Ollama; mantener el input acotado mejora la latencia.
- Lenguajes soportados: Python, Java y Kotlin (cumple el mínimo del Contexto).

## Flujo completo

1. Usuario se registra o inicia sesión → guardamos `accessToken` + datos del
   user en `localStorage`.
2. Las rutas internas están protegidas por `<ProtectedRoute>`. Si el token
   está vencido el backend devuelve `401`, `apiClient` limpia la sesión y el
   `<AuthProvider>` redirige al login en la próxima navegación.
3. Desde "Nueva auditoría" se elige lenguaje + se pega código (máx. 2000
   chars). El frontend envía `POST /api/v1/analyze` con el JWT.
4. Java consulta al microservicio Python, persiste el análisis en Postgres y
   responde con `{ issues, explanation, refactoredCode, historyId }`.
5. El frontend navega a `/audit/result/<historyId>` mostrando código original,
   refactor, issues por severidad y explicación pedagógica.
