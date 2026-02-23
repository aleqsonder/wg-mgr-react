FROM node:24.13.1 AS builder
WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .
RUN npm run build

FROM httpd:alpine AS runtime
COPY --from=builder /app/dist /usr/local/apache2/htdocs
