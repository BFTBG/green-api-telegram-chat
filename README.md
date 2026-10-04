# Telegram Web Chat — GREEN-API

> Тестовое задание на позицию **Frontend Developer (React)**.  
> Веб-интерфейс для отправки и получения **текстовых сообщений Telegram** через GREEN-API.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![GREEN--API](https://img.shields.io/badge/GREEN--API-Telegram-229ED9)](https://green-api.com/telegram/docs/)

## О проекте

Приложение повторяет минимальный сценарий веб-чата:

1. пользователь указывает учётные данные GREEN-API;
2. вводит номер получателя в международном формате;
3. приложение проверяет наличие Telegram-аккаунта через `CheckAccount`;
4. получает `chatId` и создаёт чат;
5. отправляет текст через `SendMessage`;
6. ожидает входящие уведомления через `ReceiveNotification`;
7. отображает входящее текстовое сообщение в интерфейсе;
8. удаляет обработанное уведомление через `DeleteNotification`.

Проект намеренно ограничен **текстовыми сообщениями**, как требуется в тестовом задании.

## Demo

**Онлайн-версия:** добавьте сюда URL после деплоя.

```text
https://your-domain.example
```

**Видео / GIF:** при наличии демонстрации добавьте ссылку или GIF в раздел `docs/`.

> Для реального демо требуется авторизованный Telegram-инстанс GREEN-API.

## Возможности

- React 19 + Vite 7.
- Интерфейс в стиле современного Telegram Web.
- Настройка `apiUrl`, `idInstance` и `apiTokenInstance` непосредственно в UI.
- Поиск получателя по номеру телефона.
- Создание чата после успешного `CheckAccount`.
- Отправка текстовых сообщений.
- Получение входящих сообщений без перезагрузки страницы.
- Поддержка optimistic UI при отправке.
- Индикация статуса подключения.
- Обработка ошибок API.
- Поиск по сообщениям текущего чата.
- Адаптивная верстка.
- Backend proxy на Express для работы с GREEN-API.
- Сборка frontend и backend в единый deployable-сервис.

## Технологический стек

| Технология | Назначение |
|---|---|
| **React 19** | UI и управление состоянием |
| **Vite 7** | Dev server и production build |
| **Express 5** | Backend proxy и раздача `dist/` |
| **Node.js 18+** | Runtime |
| **GREEN-API Telegram API** | Отправка и получение сообщений |
| **CSS** | UI без стороннего UI-kit |

## Архитектура

```text
┌──────────────────────────────┐
│        React + Vite          │
│                              │
│  Settings → New Chat → Chat  │
└──────────────┬───────────────┘
               │ HTTP /api/*
               ▼
┌──────────────────────────────┐
│       Express 5 proxy        │
│                              │
│  /api/check-account          │
│  /api/send-message           │
│  /api/receive                │
│  /api/health                 │
└──────────────┬───────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────┐
│        GREEN-API             │
│                              │
│ CheckAccount                 │
│ SendMessage                  │
│ ReceiveNotification          │
│ DeleteNotification           │
└──────────────┬───────────────┘
               │
               ▼
           Telegram
```

### Почему есть backend proxy

GREEN-API требует `idInstance` и `apiTokenInstance`. Вместо прямых запросов из React к GREEN-API приложение использует небольшой Express proxy.

Это даёт несколько преимуществ:

- секреты не зашиваются в исходный код frontend;
- frontend не содержит прямых URL методов GREEN-API;
- интеграцию проще заменить или расширить на backend;
- на production можно дополнительно перенести credentials из запроса в server-side secrets.

**Важно:** в текущей версии пользователь вводит credentials в UI, а React передаёт их proxy для выполнения запроса. Они не сохраняются на сервере и не находятся в репозитории.

## Структура проекта

```text
.
├── .github/
│   └── workflows/
│       └── build.yml
├── src/
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
├── server.js
├── SUBMISSION.md
└── vite.config.js
```

## Требования

Перед запуском установите:

- Node.js **18+**;
- npm **9+**;
- авторизованный Telegram-инстанс в GREEN-API.

Рекомендуемая версия Node.js для локальной разработки — **20 LTS или 22 LTS**.

## Быстрый старт

### 1. Клонирование

```bash
git clone https://github.com/YOUR_USERNAME/green-api-telegram-chat.git
cd green-api-telegram-chat
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Production build

```bash
npm run build
```

### 4. Запуск

```bash
npm start
```

Приложение будет доступно по адресу:

```text
http://localhost:3001
```

### Режим разработки

Запустите backend:

```bash
npm run server
```

В отдельном терминале запустите Vite:

```bash
npm run dev
```

Frontend будет доступен на:

```text
http://localhost:5173
```

Vite проксирует запросы `/api` на `http://localhost:3001`.

## Настройка GREEN-API

1. Создайте Telegram-инстанс в GREEN-API.
2. Авторизуйте инстанс.
3. Получите `idInstance` и `apiTokenInstance`.
4. Запустите приложение.
5. Откройте **Настройки**.
6. Укажите credentials.
7. Введите номер получателя в международном формате, например:

```text
79991234567
```

8. Нажмите **«Создать чат»**.
9. После успешной проверки отправьте текстовое сообщение.
10. Ответ собеседника появится в чате автоматически.

### Используемые методы GREEN-API

| Метод | Назначение |
|---|---|
| `CheckAccount` | Проверка номера и получение `chatId` |
| `SendMessage` | Отправка текста |
| `ReceiveNotification` | Получение следующего уведомления из очереди |
| `DeleteNotification` | Удаление обработанного уведомления |

Документация:

- https://green-api.com/telegram/docs/
- https://green-api.com/telegram/docs/api/service/CheckAccount/
- https://green-api.com/telegram/docs/api/sending/SendMessage/
- https://green-api.com/telegram/docs/api/receiving/technology-http-api/ReceiveNotification/
- https://green-api.com/telegram/docs/api/receiving/technology-http-api/DeleteNotification/

## API proxy

Frontend работает только с собственным backend API.

### `POST /api/check-account`

Проверяет номер телефона через GREEN-API.

```json
{
  "apiUrl": "https://api.greenapi.com",
  "idInstance": "4100...",
  "apiTokenInstance": "...",
  "phoneNumber": "79991234567"
}
```

### `POST /api/send-message`

Отправляет текстовое сообщение.

```json
{
  "apiUrl": "https://api.greenapi.com",
  "idInstance": "4100...",
  "apiTokenInstance": "...",
  "chatId": "79991234567@c.us",
  "message": "Привет!"
}
```

### `POST /api/receive`

Получает одно уведомление и после обработки удаляет его из очереди.

```json
{
  "apiUrl": "https://api.greenapi.com",
  "idInstance": "4100...",
  "apiTokenInstance": "...",
  "receiveTimeout": 10
}
```

### `GET /api/health`

Health check для hosting/platform monitoring.

Ответ:

```json
{
  "ok": true
}
```

## Получение сообщений

Приложение использует HTTP polling поверх `ReceiveNotification`.

Логика обработки:

```text
ReceiveNotification
        │
        ▼
  Есть notification?
      /       \
    нет       да
     │         │
     │         ▼
     │   Проверить typeWebhook
     │         │
     │         ▼
     │   incomingMessageReceived
     │         │
     │         ▼
     │    textMessage
     │         │
     │         ▼
     │    Добавить в UI
     │         │
     │         ▼
     │   DeleteNotification
     │
     └──────────────► следующий polling
```

Для тестового задания это сознательно сделано без WebSocket-инфраструктуры и без отдельной базы данных.

## Безопасность

В репозитории **нет реальных**:

- `idInstance`;
- `apiTokenInstance`;
- паролей;
- production URL с приватными credentials.

Файл `.env` исключён через `.gitignore`.

### Production рекомендации

Для реального production-приложения credentials лучше хранить исключительно на сервере:

```text
Browser
   │
   │ chatId + message
   ▼
Backend
   │
   │ server-side secrets
   ▼
GREEN-API
```

Также рекомендуется добавить authentication пользователя, rate limiting, audit logging и серверную валидацию доступа к конкретным чатам.

## UX / UI решения

Интерфейс специально сделан минималистичным, поскольку в задании требуется «максимально простой» интерфейс.

Основные состояния:

- пустой экран создания нового чата;
- окно настроек GREEN-API;
- состояние поиска получателя;
- созданный чат;
- отправка сообщения;
- ошибка отправки;
- ошибка подключения;
- пустой чат;
- поиск по сообщениям.

Интерфейс адаптирован под desktop и мобильные экраны.

## Обработка ошибок

Backend преобразует ошибки GREEN-API в единый JSON-ответ:

```json
{
  "message": "Описание ошибки"
}
```

Frontend отображает ошибку пользователю и не ломает текущий экран чата.

Отдельно обрабатываются:

- пустые credentials;
- некорректный номер;
- отсутствующий Telegram-аккаунт;
- пустое сообщение;
- сообщение длиннее 4096 символов;
- ошибки GREEN-API;
- ошибки получения уведомлений;
- неудачная отправка.

## Scripts

| Команда | Назначение |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run server` | Express backend |
| `npm run build` | Production build |
| `npm start` | Production server |

## Deployment

Проект подготовлен для Node.js hosting, например Render, Railway или собственного VPS.

### Render

**Build Command**

```bash
npm install && npm run build
```

**Start Command**

```bash
npm start
```

**Environment Variables**

```text
PORT=10000
```

Render автоматически предоставляет `PORT`, поэтому переменную можно также не задавать вручную.

После деплоя проверьте:

```text
https://YOUR-DOMAIN/api/health
```

Ожидаемый ответ:

```json
{"ok":true}
```

## CI

В репозитории добавлен GitHub Actions workflow, который при push и pull request:

1. устанавливает зависимости;
2. запускает production build.

Это позволяет быстро проверить, что изменения не ломают сборку проекта.

## Что проверить перед отправкой работодателю

- [ ] `npm install` проходит без ошибок.
- [ ] `npm run build` проходит без ошибок.
- [ ] GREEN-API Telegram-инстанс авторизован.
- [ ] `CheckAccount` находит тестовый аккаунт.
- [ ] сообщение успешно отправляется.
- [ ] ответ собеседника появляется в UI.
- [ ] обработанное уведомление удаляется через `DeleteNotification`.
- [ ] в GitHub нет `.env`, токенов и других секретов.
- [ ] онлайн-ссылка открывается извне.
- [ ] ссылка на GitHub указана в письме HR.
- [ ] приложено резюме PDF.
- [ ] указан Telegram для связи.
- [ ] указан предпочтительный формат работы.

## Формат сдачи тестового задания

В письмо работодателю рекомендуется добавить:

```text
Тема: Тестовое задание на должность — Фронтенд разработчик React

Здравствуйте!

Направляю выполненное тестовое задание.

1. Резюме: приложено PDF
2. GitHub: https://github.com/YOUR_USERNAME/green-api-telegram-chat
3. Инструкция по запуску: README.md в репозитории
4. Онлайн-версия: https://YOUR-DOMAIN
5. Видео/скриншоты: https://YOUR-DEMO-LINK
6. Telegram для связи: @YOUR_USERNAME
7. Предпочтительный формат работы: удалёнка / офис Химки / офис Астана

С уважением,
Станислав Ткаченко
```

## Ограничения текущего прототипа

Это тестовый проект, поэтому сознательно не реализованы:

- история сообщений в БД;
- список нескольких чатов;
- авторизация пользователей приложения;
- медиа, документы и файлы;
- групповые чаты;
- полноценная синхронизация истории Telegram;
- WebSocket/SSE;
- серверное хранение credentials.

Эти функции можно добавить поверх текущей архитектуры без изменения основного UI-сценария.

## License

Проект подготовлен как тестовое задание и предназначен для демонстрации навыков frontend-разработки.
