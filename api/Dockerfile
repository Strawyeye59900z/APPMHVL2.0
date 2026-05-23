FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY api/package.json ./api/
COPY shared/package.json ./shared/
RUN npm install --workspaces

COPY shared/ ./shared/
COPY api/ ./api/

WORKDIR /app/api
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/api/prisma ./api/prisma
COPY --from=builder /app/shared ./shared
COPY package.json ./

WORKDIR /app/api

EXPOSE 3001
CMD ["node", "dist/main"]
