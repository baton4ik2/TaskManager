# Этап сборки
FROM node:18-alpine AS build
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json ./
RUN npm install

# Копируем исходный код и собираем приложение
COPY . .
RUN npm run build

# Этап production
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Удаляем дефолтные файлы nginx
RUN rm -rf ./*

# Копируем собранное приложение
COPY --from=build /app/dist .

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]

