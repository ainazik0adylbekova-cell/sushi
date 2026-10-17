# Интеграция Finik Pay - Инструкция по использованию

## 📋 Обзор

Интеграция платежной системы Finik Pay с **фиксированной ценой 5 сомов** для вашего проекта Next.js.

## ✅ Что было реализовано

### 1. Основная библиотека (`lib/finik.ts`)
- ✅ Функция создания платежа `createFinikPayment()`
- ✅ Функция верификации webhook `verifyFinikWebhook()`
- ✅ Защита от replay-атак `isTimestampValid()`
- ✅ Поддержка beta и prod окружений
- ✅ Криптографические подписи через `@mancho.devs/authorizer`

### 2. API эндпоинты

#### `/api/finik/create-payment` (POST)
Создаёт платёж в Finik с фиксированной ценой 5 сомов.

**Запрос:**
```json
{
  "orderId": "uuid-заказа",
  "orderDescription": "Описание заказа"
}
```

**Ответ:**
```json
{
  "success": true,
  "paymentUrl": "https://beta.api.acquiring.averspay.kg/payment/...",
  "amount": 5,
  "orderId": "uuid-заказа"
}
```

#### `/api/finik/webhook` (POST)
Обрабатывает webhook от Finik после завершения платежа.

**Что делает:**
- Верифицирует подпись webhook
- Проверяет timestamp
- Создаёт/обновляет запись о платеже в БД
- Обновляет статус заказа
- Создаёт уведомление для пользователя

### 3. UI Компоненты

#### `FinikPayButton` (`app/components/FinikPayButton.tsx`)
Кнопка для оплаты через Finik Pay.

**Использование:**
```tsx
import FinikPayButton from "@/app/components/FinikPayButton";

<FinikPayButton
  orderId="order-123"
  orderDescription="Оплата заказа суши"
  fullWidth
  onSuccess={() => console.log("Успех!")}
  onError={(error) => console.error(error)}
/>
```

**Props:**
- `orderId` (required) - ID заказа
- `orderDescription` (optional) - Описание платежа
- `fullWidth` (optional) - Кнопка на всю ширину
- `className` (optional) - Дополнительные CSS классы
- `onSuccess` (optional) - Callback при успешном создании платежа
- `onError` (optional) - Callback при ошибке

### 4. Страницы

#### `/payment-success` (`app/payment-success/page.tsx`)
Страница, на которую возвращается пользователь после оплаты.

**URL параметры:**
- `orderId` - ID заказа
- `payment` - Статус платежа (`success` или `failed`)

### 5. Интеграция в корзину

Обновлён `CartDrawer` (`app/components/landing/CartDrawer.tsx`):
- Добавлен экран оплаты после заполнения формы
- Интегрирована кнопка Finik Pay
- Показывается информация о фиксированной цене 5 сомов

## 🚀 Как использовать

### Вариант 1: Через CartDrawer (уже интегрировано)

1. Пользователь добавляет товары в корзину
2. Нажимает "Оформить заказ"
3. Заполняет форму с данными доставки
4. Видит экран оплаты с кнопкой Finik Pay
5. Нажимает "Оплатить 5 сом"
6. Редиректится на страницу Finik Pay
7. Сканирует QR-код и оплачивает
8. Возвращается на страницу успеха

### Вариант 2: Использование компонента напрямую

```tsx
import FinikPayButton from "@/app/components/FinikPayButton";

export default function MyPage() {
  const orderId = "order-123"; // Ваш ID заказа

  return (
    <div>
      <h1>Оформление заказа</h1>
      <FinikPayButton
        orderId={orderId}
        orderDescription="Оплата заказа"
        fullWidth
        onSuccess={() => {
          // Редирект или показ уведомления
          window.location.href = `/payment-success?orderId=${orderId}&payment=success`;
        }}
      />
    </div>
  );
}
```

## 🔧 Настройка

### Переменные окружения (`.env`)

Все необходимые переменные уже настроены:

```env
FINIK_ENV="prod"
FINIK_API_KEY="WWeYjjsYE93LxEG5dI9Ce49zq5PD67yR7JfO51gC"
FINIK_ACCOUNT_ID="aadda212-e6ae-441f-8c9f-41e155849209"
FINIK_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
```

### База данных

Схема уже поддерживает все необходимые таблицы:
- `Payment` - Платежи
- `PaymentMethod` - Способы оплаты (Finik Pay создаётся автоматически)
- `Order` - Заказы
- `OrderStatus` - Статусы заказов
- `Notification` - Уведомления

## 📝 Workflow платежа

```
┌─────────────────────────────────────────────────────────┐
│ 1. Пользователь нажимает "Оплатить 5 сом"              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Запрос на /api/finik/create-payment                  │
│    - Проверка аутентификации                            │
│    - Создание платежа в Finik                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Редирект на платежную страницу Finik                 │
│    - Пользователь сканирует QR-код                      │
│    - Оплачивает 5 сомов                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Finik отправляет webhook на /api/finik/webhook       │
│    - Верификация подписи                                │
│    - Обновление статуса платежа в БД                    │
│    - Обновление статуса заказа                          │
│    - Создание уведомления                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Редирект на /payment-success?payment=success         │
│    - Показ сообщения об успешной оплате                 │
└─────────────────────────────────────────────────────────┘
```

## 🧪 Тестирование

### Локальное тестирование webhook

Для тестирования webhook на локальной машине используйте ngrok:

```bash
# Установите ngrok
# https://ngrok.com/download

# Запустите ngrok
ngrok http 3000

# Обновите .env
NEXTAUTH_URL="https://your-ngrok-url.ngrok.io"

# Перезапустите приложение
npm run dev
```

### Тестовый платёж

1. Запустите приложение
2. Добавьте товары в корзину
3. Оформите заказ
4. Нажмите "Оплатить 5 сом"
5. Следуйте инструкциям Finik Pay

## 🔒 Безопасность

- ✅ Верификация подписи webhook (публичный ключ Finik)
- ✅ Проверка timestamp для защиты от replay-атак
- ✅ Аутентификация пользователя перед созданием платежа
- ✅ Приватный ключ для подписи запросов (prod окружение)

## 📊 Логирование

Все важные события логируются в консоль:

- `[FINIK_PAYMENT]` - Создание платежа
- `[FINIK_WEBHOOK]` - Обработка webhook
- `[PAYMENT_SUCCESS]` - Успешный платёж
- Ошибки верификации подписи
- Ошибки создания платежа

## 🎨 Кастомизация

### Изменить фиксированную цену

В файле `app/api/finik/create-payment/route.ts`:

```typescript
// Измените эту строку
const FIXED_PRICE = 5;
```

### Изменить URL редиректа после оплаты

В файле `lib/finik.ts`:

```typescript
RedirectUrl: `${APP_URL}/payment-success?orderId=${data.orderId}&payment=success`,
```

### Настроить UI кнопки оплаты

В файле `app/components/FinikPayButton.tsx` можно изменить стили, текст и иконку.

## 📚 Полезные ссылки

- [Документация Finik Pay](FINIK_INTEGRATION_GUIDE (3).md)
- [Библиотека authorizer](https://www.npmjs.com/package/@mancho.devs/authorizer)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 🆘 Решение проблем

### Ошибка "Finik credentials are not configured"

Убедитесь, что в `.env` заполнены все переменные:
- `FINIK_API_KEY`
- `FINIK_ACCOUNT_ID`
- `FINIK_PRIVATE_KEY` (для prod)

### Ошибка "Unauthorized"

Пользователь не авторизован. Убедитесь, что:
1. Пользователь вошёл в систему
2. JWT токен валиден
3. Функция `verifyAuth()` работает корректно

### Webhook не приходит

1. Проверьте, что ваш сервер доступен из интернета
2. Для локального тестирования используйте ngrok
3. Убедитесь, что webhook URL правильный

### Ошибка "Invalid signature"

1. Проверьте, что используется правильный публичный ключ (beta/prod)
2. Убедитесь, что тело запроса не модифицировано
3. В dev режиме подпись проверяется, но не блокирует запрос

## ✨ Готово!

Интеграция Finik Pay полностью настроена и готова к использованию. Все необходимые компоненты созданы и интегрированы в ваше приложение.

**Цена: 5 сомов (фиксировано)**

Наслаждайтесь приёмом платежей! 🎉
