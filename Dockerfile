FROM node:22

WORKDIR /app

RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY package.json ./
# Instalar dependencias automáticamente
RUN pnpm install

# Copiar el resto del proyecto
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]