# Отладка проблем с оплатой Finik

## Проблема: После оплаты показывается "страница недоступна"

### Причины проблемы:

1. **Неправильный RedirectUrl** - Finik может возвращать статус в URL параметрах
2. **Не настроены переменные окружения** - отсутствует `NEXT_PUBLIC_APP_URL`
3. **Webhook не обрабатывается** - платеж проходит, но заказ не обновляется

### Исправления:

#### 1. Проверьте переменные окружения

В `.env` должны быть указаны:

```bash
# URL вашего приложения (для локальной разработки)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Для продакшена на Vercel
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Finik настройки
FINIK_ENV=beta
FINIK_API_KEY="your_api_key"
FINIK_ACCOUNT_ID="your_account_id"
```

#### 2. Страница payment-success теперь обрабатывает статусы:

- `?status=succeeded` - успешная оплата
- `?status=failed` - неудачная оплата
- `?status=pending` - ожидание подтверждения
- `?payment=success` - альтернативный параметр успеха
- `?payment=failed` - альтернативный параметр неудачи

#### 3. Проверка статуса заказа через API

Теперь страница автоматически проверяет статус заказа через:
```
GET /api/orders/{orderId}
```

#### 4. Webhook логирование

Webhook `/api/finik/webhook` теперь логирует:
- Статус платежа
- Сумму
- Transaction ID
- Redirect URL

### Как проверить работу:

1. **Локальная разработка:**
   ```bash
   npm run dev
   ```

2. **Проверьте логи в консоли при оплате:**
   - При создании платежа: `[FINIK_PAYMENT] Creating payment...`
   - При получении webhook: `[FINIK_WEBHOOK] Received webhook...`

3. **Проверьте URL после оплаты:**
   - Должен быть: `http://localhost:3000/payment-success?orderId=xxx&status=succeeded`
   - Или: `http://localhost:3000/payment-success?orderId=xxx&payment=success`

### Тестирование в продакшене (Vercel):

1. Убедитесь, что в Vercel установлены переменные окружения:
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
   - `FINIK_API_KEY`
   - `FINIK_ACCOUNT_ID`
   - `FINIK_ENV` = `beta` или `prod`

2. После деплоя проверьте логи в Vercel Dashboard

3. Webhook URL должен быть доступен из интернета:
   - `https://your-app.vercel.app/api/finik/webhook`

### Возможные проблемы:

#### "Страница недоступна" после оплаты
**Решение:** Проверьте, что `NEXT_PUBLIC_APP_URL` указан правильно и не содержит `/` в конце

#### Платеж проходит, но заказ не обновляется
**Решение:** 
- Проверьте логи webhook в Vercel
- Убедитесь, что webhook URL доступен извне
- Проверьте, что в базе данных создается запись в таблице `payments`

#### Показывается "Обработка платежа" бесконечно
**Решение:** 
- Проверьте параметры URL (должен быть `status` или `payment`)
- Проверьте, что API `/api/orders/{orderId}` возвращает данные

### Коммит изменений:

```bash
git add .
git commit -m "Fix: исправлена обработка статуса оплаты Finik и редирект после платежа"
git push
```

## Структура файлов:

- `lib/finik.ts` - создание платежа и webhook верификация
- `app/api/finik/create-payment/route.ts` - API создания платежа
- `app/api/finik/webhook/route.ts` - обработка webhook от Finik
- `app/payment-success/page.tsx` - страница результата оплаты
- `app/api/orders/[id]/route.ts` - API получения статуса заказа
- `app/components/FinikPayButton.tsx` - кнопка оплаты
