# Production JSON Server only (fake API). Build and deploy the Angular app separately.
# Example: docker build -t hanami-api . && docker run -p 3000:3000 -e PORT=3000 hanami-api

FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY db.json json-server-cors.cjs ./
COPY scripts/json-server-prod.cjs ./scripts/

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "server:prod"]
