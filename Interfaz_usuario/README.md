# Code Audit AI - Frontend

Frontend profesional para el TP de Programación de Vanguardia.

## Stack

- React
- Vite
- Tailwind CSS
- React Router
- Monaco Editor
- API mockeada

## Instalación

```bash
npm install
npm run dev
```

Luego abrir:

```bash
http://localhost:5173
```

## Pantallas incluidas

- Login
- Registro
- Dashboard
- Nueva auditoría
- Loading de IA
- Resultado de auditoría
- Historial
- Configuración

## Dónde conectar con Java

Modificar el archivo:

```bash
src/services/auditApi.js
```

Actualmente usa datos mock. Cuando el backend Java esté listo, reemplazar las funciones por `fetch` reales hacia:

```bash
POST /api/auth/login
POST /api/auth/register
POST /api/audits
GET /api/audits/history
GET /api/audits/{id}
```
