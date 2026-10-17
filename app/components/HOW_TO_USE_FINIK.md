# Как использовать Finik Pay в коде

## Быстрый старт

### Вариант 1: Использование готового компонента

```tsx
import FinikPayButton from "@/app/components/FinikPayButton";

export default function MyPage() {
  const orderId = "order-123"; // ID вашего заказа

  return (
    <div>
      <h1>Оплата заказа</h1>
      <FinikPayButton
        orderId={orderId}
        orderDescription="Оплата заказа суши"
        fullWidth
      />
    </div>
  );
}
```

### Вариант 2: С обработчиками событий

```tsx
import FinikPayButton from "@/app/components/FinikPayButton";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const orderId = "order-123";

  return (
    <FinikPayButton
      orderId={orderId}
      orderDescription="Оплата заказа"
      onSuccess={() => {
        console.log("Платёж создан, редирект на Finik...");
        // Можно добавить логику перед редиректом
      }}
      onError={(error) => {
        console.error("Ошибка:", error);
        alert(`Не удалось создать платёж: ${error}`);
      }}
    />
  );
}
```

### Вариант 3: Прямой вызов API

Если нужен больше контроль:

```tsx
"use client";

import { useState } from "react";

export default function CustomPayment() {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    
    try {
      const response = await fetch("/api/finik/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "order-123",
          orderDescription: "Оплата заказа",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Редирект на страницу оплаты
        window.location.href = data.paymentUrl;
      } else {
        alert("Ошибка: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Не удалось создать платёж");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handlePay} disabled={loading}>
      {loading ? "Создание платежа..." : "Оплатить 5 сом"}
    </button>
  );
}
```

## Props компонента FinikPayButton

| Prop | Тип | Обязательный | Описание |
|------|-----|-------------|----------|
| `orderId` | `string` | ✅ Да | ID заказа из БД |
| `orderDescription` | `string` | ❌ Нет | Описание платежа (по умолчанию: "Оплата заказа") |
| `fullWidth` | `boolean` | ❌ Нет | Кнопка на всю ширину (по умолчанию: false) |
| `className` | `string` | ❌ Нет | Дополнительные CSS классы |
| `onSuccess` | `() => void` | ❌ Нет | Callback при успешном создании платежа |
| `onError` | `(error: string) => void` | ❌ Нет | Callback при ошибке |

## API Эндпоинт

### POST /api/finik/create-payment

**Запрос:**
```json
{
  "orderId": "uuid-заказа",
  "orderDescription": "Описание платежа"
}
```

**Ответ (успех):**
```json
{
  "success": true,
  "paymentUrl": "https://api.acquiring.averspay.kg/payment/...",
  "amount": 5,
  "orderId": "uuid-заказа"
}
```

**Ответ (ошибка):**
```json
{
  "error": "Описание ошибки",
  "details": "Детали ошибки"
}
```

## Примеры использования

### В модальном окне

```tsx
import { useState } from "react";
import FinikPayButton from "@/app/components/FinikPayButton";

export default function OrderModal({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    isOpen && (
      <div className="modal">
        <h2>Оплата заказа</h2>
        <p>Сумма: 5 сом</p>
        <FinikPayButton
          orderId={orderId}
          fullWidth
          onSuccess={() => setIsOpen(false)}
        />
      </div>
    )
  );
}
```

### В списке заказов

```tsx
import FinikPayButton from "@/app/components/FinikPayButton";

export default function OrderList({ orders }: { orders: Order[] }) {
  return (
    <div>
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <h3>Заказ #{order.number}</h3>
          <p>Статус: {order.status}</p>
          {order.status === "PENDING" && (
            <FinikPayButton
              orderId={order.id}
              orderDescription={`Оплата заказа #${order.number}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

### На странице оформления заказа

```tsx
import FinikPayButton from "@/app/components/FinikPayButton";

export default function CheckoutPage({ order }: { order: Order }) {
  return (
    <div className="checkout">
      <h1>Оформление заказа</h1>
      
      {/* Информация о заказе */}
      <div className="order-summary">
        <h2>Ваш заказ</h2>
        {order.items.map((item) => (
          <div key={item.id}>
            {item.name} × {item.quantity}
          </div>
        ))}
        <p>Итого: {order.total} сом</p>
      </div>

      {/* Кнопка оплаты */}
      <div className="payment-section">
        <h2>Оплата</h2>
        <p>Оплата через Finik Pay: 5 сом</p>
        <FinikPayButton
          orderId={order.id}
          orderDescription={`Заказ на ${order.total} сом`}
          fullWidth
          onSuccess={() => {
            console.log("Переход на страницу оплаты...");
          }}
          onError={(error) => {
            console.error("Ошибка оплаты:", error);
          }}
        />
      </div>
    </div>
  );
}
```

## Важные замечания

### 1. Аутентификация обязательна

Пользователь должен быть авторизован для создания платежа:

```tsx
import { useAuth } from "@/app/providers/AuthProvider";

export default function PaymentSection({ orderId }: { orderId: string }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div>
        <p>Войдите, чтобы оплатить заказ</p>
        <Link href="/login">Войти</Link>
      </div>
    );
  }

  return <FinikPayButton orderId={orderId} />;
}
```

### 2. Фиксированная цена

Цена всегда 5 сомов, независимо от суммы заказа. Это настроено в:
- `app/api/finik/create-payment/route.ts` (строка: `const FIXED_PRICE = 5`)
- `app/components/FinikPayButton.tsx` (строка: `const FIXED_PRICE = 5`)

### 3. Обработка webhook

После успешной оплаты Finik автоматически отправит webhook на:
`https://yourdomain.com/api/finik/webhook`

Webhook обработчик автоматически:
- ✅ Обновит статус платежа в БД
- ✅ Обновит статус заказа
- ✅ Создаст уведомление для пользователя

### 4. Страница успеха

После оплаты пользователь вернётся на:
`https://yourdomain.com/payment-success?orderId=xxx&payment=success`

Можно кастомизировать URL в `lib/finik.ts`:
```typescript
RedirectUrl: `${APP_URL}/payment-success?orderId=${data.orderId}&payment=success`,
```

## Отладка

### Логи в консоли

При создании платежа вы увидите:
```
[FINIK_PAYMENT] Creating payment for user 123, order abc, amount: 5 сом
```

При получении webhook:
```
[FINIK_WEBHOOK] Received webhook: { status: 'SUCCEEDED', ... }
[FINIK_WEBHOOK] Payment succeeded for order abc, amount: 5 сом
[FINIK_WEBHOOK] ✓ Payment processed successfully for order abc
```

### Проверка в браузере

Откройте DevTools → Network → XHR и проверьте запрос к:
- `/api/finik/create-payment` (POST)

Ответ должен содержать `paymentUrl`.

## Дополнительная документация

- **Полная документация:** `FINIK_INTEGRATION_GUIDE (3).md`
- **Инструкции по запуску:** `FINIK_SETUP_INSTRUCTIONS.md`
- **Краткая справка:** `FINIK_INTEGRATION_README.md`
- **Примеры:** `app/components/FinikPayExample.tsx`

---

**Готово! Используйте Finik Pay в любом месте вашего приложения! 🚀**
