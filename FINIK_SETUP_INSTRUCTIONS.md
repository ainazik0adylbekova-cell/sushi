# 🚀 Инструкции по запуску Finik Pay

## ✅ Проблема решена!

Prisma клиент был успешно сгенерирован. Теперь интеграция должна работать.

## 📋 Что нужно сделать перед использованием

### 1. Проверьте переменные окружения

Откройте файл `.env` и убедитесь, что все переменные заполнены:

```env
FINIK_ENV="prod"
FINIK_API_KEY="WWeYjjsYE93LxEG5dI9Ce49zq5PD67yR7JfO51gC"
FINIK_ACCOUNT_ID="aadda212-e6ae-441f-8c9f-41e155849209"
FINIK_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
```

### 2. Если Prisma клиент не работает

Если возникает ошибка `PrismaClientValidationError`, выполните:

**Вариант А - Через npm:**
```bash
npm run db:generate
```

**Вариант Б - Через batch файл:**
Дважды кликните на файл `generate-prisma.bat` в корне проекта

**Вариант В - Вручную:**
1. Закройте dev сервер (`npm run dev`) если он запущен
2. Удалите папку `node_modules\.prisma`
3. Выполните `npm run db:generate`

### 3. Запустите dev сервер

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`

## 🧪 Как протестировать Finik Pay

### Вариант 1: Через корзину (рекомендуется)

1. Откройте http://localhost:3000
2. Перейдите в раздел "Меню"
3. Добавьте несколько блюд в корзину
4. Нажмите на иконку корзины в шапке сайта
5. Нажмите "Оформить заказ"
6. Войдите в систему (если не авторизованы)
7. Заполните форму доставки
8. Нажмите "Продолжить"
9. Увидите экран оплаты с кнопкой "Оплатить 5 сом"
10. Нажмите кнопку
11. Вас перенаправит на страницу Finik Pay
12. Отсканируйте QR-код и оплатите
13. После оплаты вернётесь на страницу успеха

### Вариант 2: Прямое тестирование API

Используйте любой HTTP клиент (Postman, Insomnia, curl):

**1. Создайте заказ (если еще нет)**

**2. Создайте платёж:**

```bash
POST http://localhost:3000/api/finik/create-payment
Content-Type: application/json
Cookie: auth-token=<ваш-jwt-токен>

{
  "orderId": "uuid-вашего-заказа",
  "orderDescription": "Тестовый платёж"
}
```

**Ответ:**
```json
{
  "success": true,
  "paymentUrl": "https://api.acquiring.averspay.kg/payment/...",
  "amount": 5,
  "orderId": "uuid-вашего-заказа"
}
```

**3. Откройте `paymentUrl` в браузере**

## 🔧 Тестирование Webhook (локально)

Для тестирования webhook на локальной машине нужен туннель (ngrok):

### Установка ngrok

1. Скачайте с https://ngrok.com/download
2. Распакуйте в любую папку
3. Зарегистрируйтесь и получите auth token

### Запуск ngrok

```bash
ngrok http 3000
```

Вы получите URL вида: `https://abc123.ngrok.io`

### Обновите .env

```env
NEXTAUTH_URL="https://abc123.ngrok.io"
NEXT_PUBLIC_APP_URL="https://abc123.ngrok.io"
```

### Перезапустите dev сервер

```bash
# Остановите текущий сервер (Ctrl+C)
npm run dev
```

Теперь webhook от Finik будет приходить на ваш локальный сервер!

## 📊 Проверка логов

### Логи создания платежа

В консоли dev сервера вы увидите:

```
[FINIK_PAYMENT] Creating payment for user 123, order abc-456, amount: 5 сом
✓ Using FINIK_PRIVATE_KEY from environment (только в prod)
```

### Логи webhook

После успешной оплаты в консоли появится:

```
[FINIK_WEBHOOK] Received webhook: { status: 'SUCCEEDED', amount: 5, transactionId: '...' }
[FINIK_WEBHOOK] Payment succeeded for order abc-456, amount: 5 сом
[FINIK_WEBHOOK] ✓ Payment processed successfully for order abc-456
```

### Проверка в базе данных

Используйте Prisma Studio для проверки данных:

```bash
npm run db:studio
```

Откроется http://localhost:5555 где вы увидите:
- Таблицу `Payment` с записью о платеже
- Таблицу `Order` с обновлённым статусом
- Таблицу `Notification` с уведомлением пользователю

## ❌ Решение проблем

### Ошибка: "Finik credentials are not configured"

**Решение:** Проверьте `.env` файл, убедитесь что все переменные заполнены

### Ошибка: "PrismaClientValidationError"

**Решение:** Выполните `npm run db:generate` или используйте `generate-prisma.bat`

### Ошибка: "Unauthorized" при создании платежа

**Решение:** Пользователь не авторизован. Войдите в систему через `/login`

### Ошибка: "Payment URL not found in response"

**Возможные причины:**
- Неправильный API ключ
- Неправильный Account ID
- Сумма платежа некорректна
- Проблема на стороне Finik

**Решение:** Проверьте логи в консоли, проверьте credentials

### Webhook не приходит

**Причины:**
- Сервер недоступен из интернета (используйте ngrok)
- Неправильный webhook URL
- Firewall блокирует входящие запросы

**Решение:** Используйте ngrok для локального тестирования

### Ошибка: "Invalid signature" в webhook

**Причины:**
- Неправильный публичный ключ
- Тело запроса модифицировано
- Проблема с Host заголовком

**Решение:** 
- В dev режиме подпись проверяется, но не блокирует
- Проверьте что используется правильный ключ (beta/prod)

## 🎯 Полезные команды

```bash
# Запуск dev сервера
npm run dev

# Генерация Prisma клиента
npm run db:generate

# Применение миграций
npm run db:migrate

# Prisma Studio (просмотр БД)
npm run db:studio

# Push схемы в БД без миграций
npm run db:push

# Сборка проекта
npm run build

# Запуск продакшн сервера
npm start
```

## 🎨 Где находятся файлы

```
syshi/
├── lib/
│   └── finik.ts                          # Основная библиотека Finik
├── app/
│   ├── api/
│   │   └── finik/
│   │       ├── create-payment/
│   │       │   └── route.ts              # API создания платежа
│   │       └── webhook/
│   │           └── route.ts              # API webhook
│   ├── components/
│   │   ├── FinikPayButton.tsx            # Кнопка оплаты
│   │   ├── FinikPayExample.tsx           # Примеры использования
│   │   └── landing/
│   │       └── CartDrawer.tsx            # Обновлённая корзина
│   └── payment-success/
│       └── page.tsx                       # Страница успеха
├── .env                                   # Переменные окружения
├── generate-prisma.bat                    # Скрипт генерации Prisma
├── FINIK_INTEGRATION_GUIDE (3).md        # Полная документация
├── FINIK_INTEGRATION_README.md           # Краткая инструкция
└── FINIK_SETUP_INSTRUCTIONS.md           # Этот файл
```

## ✨ Готово!

Теперь все должно работать. Попробуйте оформить заказ и оплатить через Finik Pay!

**Цена фиксирована: 5 сомов**

Если возникнут проблемы, проверьте:
1. ✅ Prisma client сгенерирован (`node_modules\.prisma\client` существует)
2. ✅ Dev сервер запущен (`npm run dev`)
3. ✅ Переменные окружения заполнены (`.env`)
4. ✅ Пользователь авторизован
5. ✅ Заказ создан в БД

Удачи! 🚀
