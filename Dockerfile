FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias usando npm ci (limpio) e ignorando errores de peer dependencies si los hay
RUN npm install --legacy-peer-deps

# Declarar los ARGumentos de construcción (inyectados por Easypanel)
ARG VITE_API_URL
ARG VITE_BACKEND_URL
ARG GIT_SHA

# Pasarlos a variables de entorno (ENV) para que Vite los incorpore en el build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa 2: Servidor Nginx ligero para servir los archivos
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
