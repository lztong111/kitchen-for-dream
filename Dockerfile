FROM node:18-slim AS builder

WORKDIR /app

COPY shared/ ./shared/
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN cd client && npm install
RUN cd server && npm install

COPY client/ ./client/
COPY server/ ./server/

RUN cd client && npm run build

FROM node:18-slim

WORKDIR /app

COPY --from=builder /app/server ./server
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/shared ./shared

RUN cd server && npx tsx src/db/migrate.ts && npx tsx src/db/seed.ts

RUN mkdir -p /app/server/uploads /app/data

EXPOSE 8888

CMD ["npx", "tsx", "server/src/app.ts"]
