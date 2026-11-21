# API do Projeto Nativas: Node 22 + Prisma. Usada pelo docker-compose.yml da raiz.
FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3333
ENTRYPOINT ["./docker-entrypoint.sh"]
