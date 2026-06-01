# Etapa 1: Compilación
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servidor Web Ligero
FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*

# IMPORTANTE: Revisa tu angular.json. Desde las versiones recientes de Angular, 
# la salida suele estar en dist/nombre-del-proyecto/browser. 
# Ajusta "frontend" por el nombre de tu proyecto si es necesario.
COPY --from=builder /usr/src/app/dist/frontend/browser /usr/share/nginx/html

# Copiamos la configuración de enrutamiento SPA
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]