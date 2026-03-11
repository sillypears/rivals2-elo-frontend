FROM node:24 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

#SYSCTL net.ipv6.conf.all.disable_ipv6=1

COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

#RUN sed -i '/::1.*localhost.*/d' /etc/hosts || true

EXPOSE 8006
CMD ["nginx", "-g", "daemon off;"]
