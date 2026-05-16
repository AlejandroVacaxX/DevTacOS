FROM node:22

USER root
RUN apt-get update && apt-get install -y python3 python3-pip python3-psycopg2 && pip3 install python-dotenv --break-system-packages

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