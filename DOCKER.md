# Инструкция по запуску с Docker

## Быстрый старт

1. Убедитесь, что установлены Docker и Docker Compose
2. Запустите приложение:
```bash
docker-compose up --build
```

3. Откройте в браузере:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8082/api
   - PostgreSQL: localhost:5432 (user: postgres, password: postgres, db: taskmanager)

## Полезные команды

### Запуск в фоновом режиме
```bash
docker-compose up -d
```

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только frontend
docker-compose logs -f frontend
```

### Остановка
```bash
docker-compose down
```

### Остановка с удалением данных
```bash
docker-compose down -v
```

### Пересборка без кэша
```bash
docker-compose build --no-cache
docker-compose up
```

### Перезапуск сервиса
```bash
docker-compose restart backend
docker-compose restart frontend
```

## Разработка с hot reload

Для разработки с автоматической перезагрузкой используйте:

```bash
docker-compose -f docker-compose.dev.yml up
```

Это позволит:
- Автоматически перезагружать backend при изменении кода
- Автоматически перезагружать frontend при изменении кода

## Структура портов

- **Frontend**: 3001
- **Backend**: 8082
- **H2 Console**: http://localhost:8082/api/h2-console

## База данных

Проект использует PostgreSQL 15. Данные сохраняются в Docker volume `postgres-data` и не удаляются при перезапуске контейнеров.

### Подключение к базе данных

```bash
# Через psql в контейнере
docker-compose exec postgres psql -U postgres -d taskmanager

# Или через внешний клиент
# Host: localhost
# Port: 5432
# Database: taskmanager
# User: postgres
# Password: postgres
```

### Миграции

Миграции Liquibase применяются автоматически при запуске backend. Все миграции находятся в `backend/src/main/resources/db/changelog/`.

Для полной очистки данных (включая базу данных):
```bash
docker-compose down -v
```

