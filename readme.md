## 📂 Project structure

```text
ai-chat/
├── app/                           # Исходный код FastAPI приложения
│   ├── api/                       # Эндпоинты (Роуты)
│   │   ├── v1/
│   │   │   ├── auth.py            # Регистрация, логин, refresh token
│   │   │   ├── chat.py            # Личные чаты с AI
│   │   │   ├── rooms.py           # Совместные комнаты (ты + друг + AI)
│   │   │   └── users.py           # Профиль пользователя
│   │   └── router.py              # Главный роутер (объединение v1)
│   │
│   ├── core/                      # Системные настройки и безопасность
│   │   ├── config.py              # Валидация .env (Pydantic Settings)
│   │   ├── security.py            # Хеширование и JWT логика
│   │   └── dependencies.py        # Общие зависимости FastAPI (Auth, DB)
│   │
│   ├── db/                        # Слой работы с базой данных
│   │   ├── models/                # SQLAlchemy модели (User, Chat, Message, Room)
│   │   ├── migrations/            # Alembic миграции (папка versions/)
│   │   ├── base.py                # Декларативная база Base для моделей
│   │   └── session.py             # Настройка пула и сессий PostgreSQL
│   │
│   ├── services/                  # Бизнес-логика (Сервисный слой)
│   │   ├── ai.py                  # Интеграция с прокси ds2api / DeepSeek
│   │   ├── auth.py                # Логика регистрации и сессий
│   │   ├── chat.py                # Обработка истории сообщений
│   │   └── rate_limiter.py        # Ограничение запросов через Redis
│   │
│   ├── schemas/                   # Pydantic схемы (Валидация данных)
│   │   ├── user.py                # Схемы для профиля и входа
│   │   ├── chat.py                # Схемы для сообщений и чатов
│   │   └── room.py                # Схемы для совместных комнат
│   │
│   ├── websocket/                 # Real-time функционал чата
│   │   ├── manager.py             # ConnectionManager (управление комнатами)
│   │   └── handlers.py            # Обработка событий и broadcast сообщений
│   │
│   └── main.py                    # Точка входа и инициализация FastAPI
│
├── tests/                         # Автотесты (Pytest)
│   ├── unit/                      # Изолированные тесты логики
│   └── integration/               # Тесты эндпоинтов и работы с БД
│
├── .env                           # Локальные секреты проекта (Игнорируется Git)
├── .env.example                   # Пустой шаблон переменных окружения
├── .gitignore                     # Список исключений для Git
├── alembic.ini                    # Конфигурация миграций Alembic
├── config.json                    # Аккаунты DeepSeek для ds2api (Игнорируется Git)
├── config.example.json            # Шаблон конфигурации ds2api
├── docker-compose.yml             # Оркестрация контейнеров (API, ds2api, DB, Redis)
├── Dockerfile                     # Сборка production-образа FastAPI
└── requirements.txt               # Зависимости Python проекта
```


## Getting Started

Этот проект использует API [Groq](https://groq.com/). Для стабильного доступа к сервису из РФ/РБ используется Cloudflare WARP в режиме локального прокси-сервера.

---

### Быстрая настройка WARP (Linux / Ubuntu / Debian)

Выполните эти команды в терминале для установки и настройки прокси.

### 1. Установка Cloudflare WARP
```bash
# Добавление ключа репозитория
curl -fsSL https://cloudflareclient.com | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg

# Добавление репозитория в систему
echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://cloudflareclient.com \$(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list

# Обновление пакетов и установка
sudo apt update && sudo apt install cloudflare-warp -y
```

### 2. Запуск фоновой службы
```bash
sudo systemctl enable --now warp-svc
```

### 3. Настройка и подключение proxy
```bash
# Регистрация нового клиента в сети
warp-cli registration new

# Переключение WARP в режим локального прокси
warp-cli mode proxy

# Назначение порта для SOCKS5/HTTP прокси
warp-cli proxy port 40000

# Запуск подключения
warp-cli connect
```

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose installed
- Docker Desktop running (Windows/macOS)

### Run

```bash
# Clone the repository
git clone https://github.com/Kol1brii/MyAI.git
cd MyAI

# Copy environment variables
cp .env-example .env  # Linux/macOS
# or
copy .env-example .env  # Windows

# Run with Docker
docker compose up --build
```
### Взаимодействие с проектом осуществляется через эти ссылки:

- Frontend: http://localhost:3000
- The API will be available at: http://localhost:8000
- Interactive Swagger docs: http://localhost:8000/docs
- API ds2api will be available at: http://172.19.0.2:5001/ 
- ReDoc: http://localhost:8000/redoc