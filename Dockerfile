FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_BASE=/
RUN sed -i "s|base: \"/SequenceDefiner/\"|base: \"${VITE_BASE}\"|" vite.config.ts && \
    npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
