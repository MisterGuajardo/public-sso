# Etapa 1: Desarrollo y Construcción
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (necesarias para compilar NestJS)
RUN npm ci

# Copiar el resto del código
COPY . .

# Compilar la aplicación a JavaScript
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Variables de entorno por defecto para la imagen
ENV NODE_ENV=production
ENV PORT=3001

# Copiar manifiestos
COPY package*.json ./

# Instalar SOLO las dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar la carpeta compilada desde la etapa de construcción
COPY --from=builder /usr/src/app/dist ./dist

# Exponer el puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "dist/main.js"]