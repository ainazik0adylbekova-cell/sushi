# Bugfix Requirements Document

## Introduction

Multiple API endpoints are returning 500 Internal Server Errors due to missing or placeholder environment variable validation. The system attempts to use unconfigured credentials (Finik payment API keys, Telegram bot tokens) without proper error handling, causing server crashes instead of user-friendly error messages. This blocks core functionality including user registration (when it encounters database/role errors), payment processing, and admin authentication.

## Bug Analysis

### Current Behavior (Defect)

**Registration Endpoint:**
1.1 WHEN user submits registration form AND database role creation fails THEN the system returns HTTP 500 with generic error message "Ошибка при регистрации. Попробуйте позже."

1.2 WHEN user submits registration form AND any unhandled database constraint error occurs THEN the system returns HTTP 500 without specific error details to help debugging

**Finik Payment Endpoint:**
1.3 WHEN user clicks "Оплатить через Finik" button AND FINIK_API_KEY is set to placeholder value "your-api-key-here" THEN the system calls createFinikPayment() which throws error "Finik credentials are not configured" resulting in HTTP 500

1.4 WHEN user clicks "Оплатить через Finik" button AND FINIK_ACCOUNT_ID is set to placeholder value "your-account-id-here" THEN the system calls createFinikPayment() which throws error "Finik credentials are not configured" resulting in HTTP 500

1.5 WHEN user clicks "Оплатить через Finik" button AND FINIK_API_KEY is empty/undefined THEN the system calls createFinikPayment() which throws error "Finik credentials are not configured" resulting in HTTP 500

1.6 WHEN user clicks "Оплатить через Finik" button AND FINIK_ACCOUNT_ID is empty/undefined THEN the system calls createFinikPayment() which throws error "Finik credentials are not configured" resulting in HTTP 500

**Admin 2FA Code Sending Endpoint:**
1.7 WHEN admin enters correct credentials on /admin/login AND TELEGRAM_BOT_TOKEN is empty/undefined THEN the system returns HTTP 500 with error "TELEGRAM_BOT_TOKEN не настроен"

1.8 WHEN admin enters correct credentials on /admin/login AND TELEGRAM_BOT_TOKEN is set to placeholder value THEN the system returns HTTP 500 with Telegram API error

### Expected Behavior (Correct)

**Registration Endpoint:**
2.1 WHEN user submits registration form AND database role creation fails THEN the system SHALL return HTTP 500 with detailed error information in development mode (including error.message and error.stack in console logs) to aid debugging

2.2 WHEN user submits registration form AND any unhandled database constraint error occurs THEN the system SHALL log the complete error details to console and return HTTP 500 with the error details included in response body for development environments

**Finik Payment Endpoint:**
2.3 WHEN user clicks "Оплатить через Finik" button AND FINIK_API_KEY is set to placeholder value "your-api-key-here" THEN the system SHALL detect invalid configuration and return HTTP 503 Service Unavailable with user-friendly message "Оплата временно недоступна. Платежная система не настроена."

2.4 WHEN user clicks "Оплатить через Finik" button AND FINIK_ACCOUNT_ID is set to placeholder value "your-account-id-here" THEN the system SHALL detect invalid configuration and return HTTP 503 Service Unavailable with user-friendly message "Оплата временно недоступна. Платежная система не настроена."

2.5 WHEN user clicks "Оплатить через Finik" button AND FINIK_API_KEY is empty/undefined THEN the system SHALL detect missing configuration and return HTTP 503 Service Unavailable with user-friendly message "Оплата временно недоступна. Платежная система не настроена."

2.6 WHEN user clicks "Оплатить через Finik" button AND FINIK_ACCOUNT_ID is empty/undefined THEN the system SHALL detect missing configuration and return HTTP 503 Service Unavailable with user-friendly message "Оплата временно недоступна. Платежная система не настроена."

**Admin 2FA Code Sending Endpoint:**
2.7 WHEN admin enters correct credentials on /admin/login AND TELEGRAM_BOT_TOKEN is empty/undefined THEN the system SHALL allow bypass authentication (creating admin_session cookie directly) and return HTTP 200 with {ok: true, bypass: true}

2.8 WHEN admin enters correct credentials on /admin/login AND TELEGRAM_BOT_TOKEN is set to placeholder value THEN the system SHALL detect invalid token configuration and return HTTP 503 Service Unavailable with user-friendly message "2FA временно недоступна. Telegram бот не настроен."

### Unchanged Behavior (Regression Prevention)

**Registration Endpoint:**
3.1 WHEN user submits valid registration data AND all environment variables are properly configured AND database roles exist THEN the system SHALL CONTINUE TO create user account, set session cookie, and return HTTP 201 with user data

3.2 WHEN user submits registration with existing email THEN the system SHALL CONTINUE TO return HTTP 409 with error "Этот email уже зарегистрирован"

3.3 WHEN user submits registration with invalid email format THEN the system SHALL CONTINUE TO return HTTP 400 with error "Некорректный email"

3.4 WHEN user submits registration with password shorter than 6 characters THEN the system SHALL CONTINUE TO return HTTP 400 with error "Пароль должен содержать минимум 6 символов"

3.5 WHEN user submits registration without name THEN the system SHALL CONTINUE TO return HTTP 400 with error "Введите имя"

**Finik Payment Endpoint:**
3.6 WHEN user clicks "Оплатить через Finik" button AND all Finik credentials are properly configured (non-placeholder values) AND user is authenticated THEN the system SHALL CONTINUE TO create payment with fixed price 5 KGS and return HTTP 200 with {success: true, paymentUrl, amount, orderId}

3.7 WHEN unauthenticated user attempts to create Finik payment THEN the system SHALL CONTINUE TO return HTTP 401 with error "Unauthorized"

3.8 WHEN user attempts to create Finik payment without orderId THEN the system SHALL CONTINUE TO return HTTP 400 with error "Missing orderId"

**Admin 2FA Code Sending Endpoint:**
3.9 WHEN admin enters correct credentials AND TELEGRAM_BOT_TOKEN is configured AND chat_id can be determined THEN the system SHALL CONTINUE TO generate 6-digit code, save it in admin_2fa_code cookie, send it via Telegram, and return HTTP 200 with {ok: true}

3.10 WHEN admin enters incorrect email or password THEN the system SHALL CONTINUE TO return HTTP 401 with error "Неверный email или пароль"

3.11 WHEN admin enters correct credentials AND Telegram is properly configured BUT message sending fails THEN the system SHALL CONTINUE TO return HTTP 500 with error "Ошибка Telegram: {description}"
