# 🔧 Настройка Google Cloud Console для OAuth

## Проблема

Google OAuth не работает - ошибка "Не удалось войти через Google"

## Решение

### Шаг 1: Откройте Google Cloud Console

Перейдите по ссылке: https://console.cloud.google.com/apis/credentials

### Шаг 2: Найдите ваш OAuth 2.0 Client ID

Ваш Client ID находится в Google Cloud Console в разделе Credentials.

1. В списке credentials найдите OAuth 2.0 Client IDs
2. Нажмите на ваш Client ID для редактирования

### Шаг 3: Проверьте Authorized redirect URIs

В разделе **"Authorized redirect URIs"** должны быть:

#### Для локальной разработки:
```
http://localhost:3000/api/auth/google/callback
```

#### Если используете другой порт:
```
http://localhost:ПОРТ/api/auth/google/callback
```

#### Для продакшена (когда будет):
```
https://yourdomain.com/api/auth/google/callback
```

### Шаг 4: Добавьте redirect URI если нет

1. Нажмите "+ ADD URI"
2. Введите: `http://localhost:3000/api/auth/google/callback`
3. Нажмите **SAVE** внизу страницы

### Шаг 5: Проверьте Authorized JavaScript origins (опционально)

В разделе **"Authorized JavaScript origins"** можно добавить:

```
http://localhost:3000
```

Но это не обязательно для OAuth callback.

## Проверка после настройки

1. **Подождите 1-2 минуты** после сохранения (Google нужно время на обновление)
2. **Перезапустите dev сервер:**
   ```bash
   Ctrl+C
   npm run dev
   ```
3. Попробуйте войти через Google снова

## Типичные ошибки

### Ошибка: "redirect_uri_mismatch"

**Причина:** redirect_uri не добавлен в Google Cloud Console

**Решение:** Добавьте `http://localhost:3000/api/auth/google/callback` в Authorized redirect URIs

### Ошибка: "invalid_client"

**Причина:** Неправильный Client ID или Client Secret в `.env`

**Решение:** Проверьте что в `.env` правильные credentials без лишних пробелов

### Ошибка: "access_denied"

**Причина:** Пользователь отменил вход или нет разрешений

**Решение:** Попробуйте еще раз, дайте разрешения при входе

## Проверка credentials в .env

Откройте `.env` и убедитесь:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_FROM_CONSOLE.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_FROM_CONSOLE"
```

**Важно:**
- ✅ Без пробелов после `=`
- ✅ `GOOGLE_CLIENT_SECRET` (не `GOOGLE_CLIENT_SECRET_ID`)
- ✅ Значения в кавычках

## Альтернатива: Обычная регистрация

Если Google OAuth продолжает не работать, используйте обычную регистрацию:

1. Запустите `init-roles.bat` (один раз)
2. Откройте http://localhost:3000/register
3. Зарегистрируйтесь с email и паролем

## Полезные ссылки

- Google Cloud Console: https://console.cloud.google.com/
- OAuth Credentials: https://console.cloud.google.com/apis/credentials
- Google OAuth2 Docs: https://developers.google.com/identity/protocols/oauth2

---

**После настройки обязательно перезапустите dev сервер!**

```bash
Ctrl+C
npm run dev
```
