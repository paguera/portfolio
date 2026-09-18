FROM docker.io/library/node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN node node_modules/typescript/bin/tsc

FROM docker.io/library/node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/*.sql ./src/

EXPOSE 3000
CMD ["node", "dist/src/server.js"]
