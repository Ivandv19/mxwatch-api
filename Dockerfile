FROM oven/bun:latest

WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la caché de Docker
COPY package.json bun.lock ./

# Instalamos dependencias usando el lockfile para consistencia
RUN bun install --frozen-lockfile

# Copiamos archivos de configuración necesarios para Drizzle y TS
COPY drizzle.config.ts tsconfig.json ./

# Copiamos el resto del código fuente del backend
COPY src ./src

# Exponemos el puerto en el que corre la API (Hono default es 3001 según tu index.ts)
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production

# Comando para arrancar el servidor Bun
CMD ["bun", "run", "src/index.ts"]
