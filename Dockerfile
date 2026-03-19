FROM node:24 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

#SYSCTL net.ipv6.conf.all.disable_ipv6=1

COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf.template

#RUN sed -i '/::1.*localhost.*/d' /etc/hosts || true

EXPOSE 8006
CMD ["/bin/sh", "-c", "NGINX_PORT=${NGINX_PORT:-8006} NGINX_HOST=${NGINX_HOST:-192.168.1.30} envsubst '$NGINX_PORT $NGINX_HOST' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
