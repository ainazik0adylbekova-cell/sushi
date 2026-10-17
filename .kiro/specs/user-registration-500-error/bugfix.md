# Bugfix Requirements Document

## Introduction

При попытке регистрации нового пользователя через форму на странице `/login` (вкладка "Регистрация") сервер возвращает ошибку 500 Internal Server Error с сообщением "The column `users.avatarUrl` does not exist in the current database."

Причина: схема Prisma содержит поле `avatarUrl` в модели `User`, но соответствующая колонка отсутствует в базе данных PostgreSQL. Это создает несоответствие между ORM-схемой и физической структурой базы данных.

Решение: удалить поле `avatarUrl` из схемы Prisma, так как функционал аватаров не требуется, и в базе данных нет существующих пользователей для сохранения.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN пользователь отправляет POST-запрос на `/api/auth/register` с валидными данными (name, email, phone, password) THEN система возвращает ошибку 500 Internal Server Error с сообщением "The column `users.avatarUrl` does not exist in the current database"

1.2 WHEN Prisma пытается создать запись пользователя через `prisma.user.create()` THEN операция завершается неудачей из-за несоответствия между схемой Prisma (содержащей `avatarUrl`) и структурой базы данных (не содержащей колонку `avatarUrl`)

1.3 WHEN происходит ошибка регистрации THEN пользователь видит сообщение "Ошибка при регистрации. Попробуйте позже" и не может зарегистрироваться в системе

### Expected Behavior (Correct)

2.1 WHEN пользователь отправляет POST-запрос на `/api/auth/register` с валидными данными (name, email, phone, password) THEN система SHALL успешно создать нового пользователя и вернуть статус 201 с данными пользователя

2.2 WHEN Prisma выполняет `prisma.user.create()` THEN операция SHALL завершаться успешно, так как схема Prisma будет соответствовать структуре базы данных (без поля `avatarUrl`)

2.3 WHEN регистрация завершается успешно THEN система SHALL автоматически авторизовать пользователя, установить сессию и вернуть данные пользователя (id, name, email, role)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN пользователь пытается зарегистрироваться с уже существующим email THEN система SHALL CONTINUE TO возвращать ошибку 409 Conflict с сообщением "Этот email уже зарегистрирован"

3.2 WHEN пользователь отправляет невалидные данные (отсутствует имя, некорректный email, короткий пароль) THEN система SHALL CONTINUE TO возвращать ошибку 400 Bad Request с соответствующим сообщением валидации

3.3 WHEN происходит успешная регистрация THEN система SHALL CONTINUE TO создавать пользователя с ролью "Пользователь", устанавливать `isActive: true` и `isVerified: false`

3.4 WHEN происходит успешная регистрация THEN система SHALL CONTINUE TO хешировать пароль с помощью bcrypt с 10 раундами

3.5 WHEN происходит успешная регистрация THEN система SHALL CONTINUE TO нормализовать email (toLowerCase и trim) перед сохранением

3.6 WHEN другие API endpoints обращаются к модели User (например, `/api/auth/login`, `/api/auth/me`) THEN они SHALL CONTINUE TO работать корректно без ошибок, связанных со структурой модели User

## Bug Condition & Property

### Bug Condition Function

```pascal
FUNCTION isBugCondition(registrationRequest)
  INPUT: registrationRequest of type {name, email, phone, password}
  OUTPUT: boolean
  
  // Bug occurs when trying to register any user while schema has avatarUrl field
  RETURN (prismaSchema.User.hasField("avatarUrl") = true) AND 
         (database.users.hasColumn("avatarUrl") = false)
END FUNCTION
```

### Property: Fix Checking

```pascal
// Property: Fix Checking - Registration Success
FOR ALL registrationRequest WHERE isBugCondition(registrationRequest) DO
  result ← POST("/api/auth/register", registrationRequest)
  ASSERT result.status = 201 AND
         result.body.success = true AND
         result.body.user.id IS NOT NULL AND
         result.body.user.name = registrationRequest.name AND
         result.body.user.email = registrationRequest.email
END FOR
```

### Property: Preservation Checking

```pascal
// Property: Preservation Checking - Existing Functionality
FOR ALL registrationRequest WHERE NOT isBugCondition(registrationRequest) DO
  // After fix, validation, role assignment, password hashing should remain unchanged
  ASSERT F(registrationRequest) = F'(registrationRequest)
END FOR
```

**Where:**
- **F**: Original registration function (before removing avatarUrl)
- **F'**: Fixed registration function (after removing avatarUrl from schema)
- **isBugCondition**: True when Prisma schema contains avatarUrl but database doesn't
