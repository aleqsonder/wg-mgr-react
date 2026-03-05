FROM node:24.13.1 AS builder
WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .
RUN npm run build


FROM httpd:2.4-alpine AS runtime
WORKDIR /usr/local/apache2

# install envsubst
RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/local/apache2/htdocs
COPY httpd.template.conf conf
RUN cp conf/httpd.conf conf/httpd.backup.conf

COPY entrypoint.sh .
CMD [ "sh", "entrypoint.sh" ]
