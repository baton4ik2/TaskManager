# Task Manager - Система управления задачами

Приложение для управления проектами и задачами, похожее на Jira.

## Технологии

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security (JWT аутентификация, OAuth2)
- Spring Data JPA
- PostgreSQL 15
- Liquibase (миграции базы данных)
- Maven

### Frontend
- TypeScript
- React 18
- React Router
- TanStack Query (React Query)
- Axios
- Vite
- Nginx (для production)

### Инфраструктура
- Docker
- Docker Compose

## Структура проекта

```
TaskManager/
├── backend/          # Spring Boot приложение
│   ├── src/
│   │   └── main/
│   │       ├── java/com/taskmanager/
│   │       │   ├── model/        # Модели данных (User, Project, Task, Comment)
│   │       │   ├── repository/   # JPA репозитории
│   │       │   ├── service/      # Бизнес-логика
│   │       │   ├── controller/   # REST API контроллеры
│   │       │   ├── dto/          # Data Transfer Objects
│   │       │   ├── config/       # Конфигурация (Security, etc.)
│   │       │   └── util/         # Утилиты (JWT)
│   │       └── resources/
│   │           ├── application.yml
│   │           └── db/changelog/  # Liquibase миграции
│   ├── Dockerfile
│   └── pom.xml
├── frontend/         # React приложение
│   ├── src/
│   │   ├── pages/    # Страницы приложения
│   │   ├── components/ # Компоненты (если будут)
│   │   ├── services/ # API сервисы
│   │   ├── contexts/ # React контексты (Auth)
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Функциональность

### Реализовано:
- ✅ Аутентификация и авторизация (JWT)
- ✅ OAuth2 авторизация через Google и Yandex
- ✅ Управление пользователями
- ✅ Управление проектами
- ✅ Управление задачами (CRUD)
- ✅ Статусы задач (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- ✅ Приоритеты задач (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Типы задач (TASK, BUG, STORY, EPIC)
- ✅ Kanban доска для задач
- ✅ Связь задач с проектами
- ✅ Назначение исполнителей
- ✅ Docker контейнеризация
- ✅ PostgreSQL база данных
- ✅ Liquibase миграции

### Планируется:
- Комментарии к задачам (таблица уже создана)
- История изменений
- Фильтры и поиск
- Вложения к задачам
- Уведомления
- Расширенные роли и права доступа

## Запуск проекта

### С помощью Docker (рекомендуется)

1. Убедитесь, что установлены:
   - Docker 20.10+
   - Docker Compose 2.0+

2. Запустите все сервисы:
```bash
docker-compose up --build
```

3. Приложение будет доступно:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8082/api
   - PostgreSQL: localhost:5432 (user: postgres, password: postgres, db: taskmanager)

### Остановка
```bash
docker-compose down
```

### Остановка с удалением данных
```bash
docker-compose down -v
```

### Локальная разработка

#### Backend

1. Убедитесь, что установлены:
   - Java 17+
   - Maven 3.6+

2. Перейдите в директорию backend:
```bash
cd backend
```

3. Запустите приложение:
```bash
mvn spring-boot:run
```

Backend будет доступен по адресу: `http://localhost:8082/api`

**Важно:** Убедитесь, что PostgreSQL запущен и доступен на `localhost:5432` с базой данных `taskmanager`.

#### Frontend

1. Убедитесь, что установлен Node.js 18+

2. Перейдите в директорию frontend:
```bash
cd frontend
```

3. Установите зависимости:
```bash
npm install
```

4. Запустите dev сервер:
```bash
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:3001`

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить информацию о текущем пользователе (требует аутентификации)
- `GET /api/oauth2/authorization/google` - Вход через Google OAuth2
- `GET /api/oauth2/authorization/yandex` - Вход через Yandex OAuth2

### Проекты
- `GET /api/projects` - Список проектов
- `GET /api/projects/{id}` - Получить проект
- `POST /api/projects` - Создать проект
- `PUT /api/projects/{id}` - Обновить проект
- `DELETE /api/projects/{id}` - Удалить проект

### Задачи
- `GET /api/tasks` - Список задач (с фильтрами projectId, assigneeId)
- `GET /api/tasks/{id}` - Получить задачу
- `POST /api/tasks` - Создать задачу
- `PUT /api/tasks/{id}` - Обновить задачу
- `DELETE /api/tasks/{id}` - Удалить задачу

## База данных

Проект использует **PostgreSQL 15** с **Liquibase** для управления миграциями.

### Миграции Liquibase

Миграции находятся в `backend/src/main/resources/db/changelog/`:
- `db.changelog-master.yaml` - главный файл миграций
- `changes/` - отдельные файлы миграций для каждой таблицы

### Структура миграций:
1. `001-create-users-table.yaml` - таблица пользователей
2. `002-create-projects-table.yaml` - таблица проектов
3. `003-create-tasks-table.yaml` - таблица задач
4. `004-create-comments-table.yaml` - таблица комментариев
5. `005-create-project-members-table.yaml` - связующая таблица проектов и пользователей

### Создание новых миграций

При добавлении новых таблиц или изменении схемы:

1. Создайте новый файл миграции в `backend/src/main/resources/db/changelog/changes/`
2. Добавьте ссылку на него в `db.changelog-master.yaml`
3. Миграции применятся автоматически при запуске приложения

Пример:
```yaml
# db.changelog/changes/006-add-new-column.yaml
databaseChangeLog:
  - changeSet:
      id: 006-add-new-column
      author: your-name
      changes:
        - addColumn:
            tableName: tasks
            columns:
              - column:
                  name: new_column
                  type: VARCHAR(255)
```

### Подключение к базе данных

**В Docker:**
- Host: `postgres` (имя сервиса)
- Port: `5432`
- Database: `taskmanager`
- User: `postgres`
- Password: `postgres`

**Локально:**
- Host: `localhost`
- Port: `5432`
- Database: `taskmanager`
- User: `postgres`
- Password: `postgres`

## Полезные команды Docker

```bash
# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend

# Пересборка без кэша
docker-compose build --no-cache

# Остановка и удаление контейнеров
docker-compose down

# Остановка, удаление контейнеров и volumes (включая данные БД)
docker-compose down -v

# Перезапуск сервиса
docker-compose restart backend
docker-compose restart postgres

# Подключение к PostgreSQL через psql
docker-compose exec postgres psql -U postgres -d taskmanager
```

## Настройка OAuth2 (Google и Yandex)

Приложение поддерживает вход через Google и Yandex. OAuth2 авторизация полностью реализована и работает.

### Как это работает

1. Пользователь нажимает кнопку "Google" или "Yandex" на странице входа
2. Происходит редирект на страницу авторизации провайдера
3. После успешной авторизации пользователь возвращается в приложение
4. Система автоматически создает или обновляет пользователя в базе данных
5. Пользователь получает JWT токен и автоматически входит в систему

### Особенности OAuth2 авторизации

- **Автоматическое создание пользователей**: При первом входе через OAuth2 пользователь автоматически создается в системе
- **Умная генерация username**: 
  - Для Yandex используется `login` из атрибутов (если доступен)
  - Для Google используется `preferred_username` или email
  - При конфликте username автоматически добавляется номер
- **Поддержка пользователей без пароля**: OAuth2 пользователи не имеют пароля в системе
- **Связывание аккаунтов**: Если пользователь с таким email уже существует, OAuth2 данные привязываются к существующему аккаунту

### 1. Google OAuth2

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 Client ID:
   - Тип: Web application
   - Authorized redirect URIs: `http://localhost:8082/api/login/oauth2/code/google`
5. Скопируйте Client ID и Client Secret

### 2. Yandex OAuth2

1. Перейдите в [Yandex OAuth](https://oauth.yandex.ru/)
2. Создайте новое приложение
3. Укажите следующие значения:
   - **Callback URI (Redirect URI)**: `http://localhost:8082/api/login/oauth2/code/yandex`
   - **Suggest hostname**: `localhost`
4. Скопируйте Client ID (ID приложения) и Client Secret (Пароль)

**Важно:** URL должен совпадать точно, включая протокол (`http://`), хост (`localhost`), порт (`:8082`) и путь (`/api/login/oauth2/code/yandex`).

### 3. Настройка переменных окружения

Добавьте следующие переменные окружения в `docker-compose.yml` или в `.env` файл:

```yaml
environment:
  - GOOGLE_CLIENT_ID=your-google-client-id
  - GOOGLE_CLIENT_SECRET=your-google-client-secret
  - YANDEX_CLIENT_ID=your-yandex-client-id
  - YANDEX_CLIENT_SECRET=your-yandex-client-secret
```

Или обновите `application.yml` и `application-docker.yml` напрямую (не рекомендуется для production).

### 4. Использование

После настройки пользователи смогут войти через кнопки "Google" или "Yandex" на странице входа. После успешной авторизации они автоматически перенаправляются на главную страницу приложения.

**Важно:** Для production измените redirect URIs на ваш домен.

## Разработка

### Добавление новых функций

1. Создайте модель в `backend/src/main/java/com/taskmanager/model/`
2. Создайте репозиторий в `backend/src/main/java/com/taskmanager/repository/`
3. Создайте сервис в `backend/src/main/java/com/taskmanager/service/`
4. Создайте контроллер в `backend/src/main/java/com/taskmanager/controller/`
5. Создайте DTO в `backend/src/main/java/com/taskmanager/dto/`
6. Добавьте API методы в `frontend/src/services/api.ts`
7. Создайте страницы/компоненты в `frontend/src/pages/` или `frontend/src/components/`

### Hot Reload в Docker

Для разработки с hot reload можно использовать volumes для монтирования исходного кода:

```yaml
# В docker-compose.yml для backend (только для разработки)
volumes:
  - ./backend/src:/app/src
```

## Лицензия

MIT
