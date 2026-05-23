FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY web/package.json ./web/
COPY shared/package.json ./shared/
RUN npm install --workspaces

COPY shared/ ./shared/
COPY web/ ./web/

WORKDIR /app/web
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/web

ENV NODE_ENV=production
COPY --from=builder /app/web/.next/standalone .
COPY --from=builder /app/web/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
