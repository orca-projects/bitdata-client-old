FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:qa
# RUN npm run build:production


FROM node:22-alpine

WORKDIR /app

RUN npm install -g pm2

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/app.js ./
COPY --from=builder /app/ecosystem.config.cjs ./
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--env", "qa"]
# CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--env", "production"]