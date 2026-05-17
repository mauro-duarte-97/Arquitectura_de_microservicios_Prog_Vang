# --- Etapa 1: build de Vite (Node) ---------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Instalacion de dependencias primero para aprovechar la cache de Docker
# cuando solo cambia el codigo fuente.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# La URL del backend se inyecta en build time porque Vite resuelve las
# variables `import.meta.env.VITE_*` cuando compila. Default apunta a
# localhost:8080 porque el browser corre en el host del usuario.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# --- Etapa 2: servir estaticos con nginx ---------------------------------
FROM nginx:alpine

# Reemplaza la config default por una que soporta SPA (history API).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia el build de Vite al docroot de nginx.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
