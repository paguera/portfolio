FROM docker.io/library/node:latest AS build
ARG VITE_BASE_URL
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN VITE_BASE_URL=$VITE_BASE_URL node node_modules/typescript/bin/tsc -b && npx vite build

FROM docker.io/library/nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
