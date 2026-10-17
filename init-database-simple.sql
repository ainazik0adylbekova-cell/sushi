-- =============================================================================
-- УПРОЩЕННЫЙ SQL скрипт для инициализации базы данных «Суши Жейм»
-- Этот скрипт пропускает создание ENUM типов (они уже существуют)
-- =============================================================================

-- =============================================================================
-- ТАБЛИЦЫ
-- =============================================================================

-- 1. РОЛИ
CREATE TABLE IF NOT EXISTS "roles" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(50) UNIQUE NOT NULL,
    "description" TEXT
);

-- 2. ПОЛЬЗОВАТЕЛИ
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) UNIQUE,
    "email" VARCHAR(255) UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "isVerified" BOOLEAN DEFAULT false NOT NULL,
    "lastLoginAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "roleId" TEXT NOT NULL,
    CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3. СЕССИИ
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "refreshToken" VARCHAR(512) UNIQUE NOT NULL,
    "userAgent" VARCHAR(512),
    "ipAddress" VARCHAR(45),
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. КАТЕГОРИИ
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) UNIQUE NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER DEFAULT 0 NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL
);

-- 5. ТЕГИ
CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(50) UNIQUE NOT NULL,
    "color" VARCHAR(20)
);

-- 6. ТОВАРЫ
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) UNIQUE NOT NULL,
    "description" TEXT,
    "ingredients" TEXT,
    "calories" INTEGER,
    "proteins" DECIMAL(6, 2),
    "fats" DECIMAL(6, 2),
    "carbohydrates" DECIMAL(6, 2),
    "price" DECIMAL(10, 2) NOT NULL,
    "discountPrice" DECIMAL(10, 2),
    "weight" DECIMAL(8, 2),
    "piecesCount" INTEGER,
    "cookingTimeMin" INTEGER,
    "isAvailable" BOOLEAN DEFAULT true NOT NULL,
    "isPopular" BOOLEAN DEFAULT false NOT NULL,
    "sortOrder" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 7. ИЗОБРАЖЕНИЯ ТОВАРА
CREATE TABLE IF NOT EXISTS "product_images" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "url" TEXT NOT NULL,
    "altText" VARCHAR(255),
    "sortOrder" INTEGER DEFAULT 0 NOT NULL,
    "isMain" BOOLEAN DEFAULT false NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- СВЯЗЬ M:N между товарами и тегами
CREATE TABLE IF NOT EXISTS "product_tags" (
    "productId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    PRIMARY KEY ("productId", "tagId"),
    CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. АДРЕСА
CREATE TABLE IF NOT EXISTS "addresses" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" VARCHAR(100),
    "city" VARCHAR(100) NOT NULL,
    "street" VARCHAR(150) NOT NULL,
    "house" VARCHAR(20) NOT NULL,
    "apartment" VARCHAR(20),
    "entrance" VARCHAR(20),
    "floor" VARCHAR(20),
    "intercom" VARCHAR(20),
    "comment" TEXT,
    "latitude" DECIMAL(10, 8),
    "longitude" DECIMAL(11, 8),
    "isDefault" BOOLEAN DEFAULT false NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 9. КОРЗИНА
CREATE TABLE IF NOT EXISTS "carts" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" TEXT UNIQUE NOT NULL,
    CONSTRAINT "carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "quantity" INTEGER DEFAULT 1 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE ("cartId", "productId")
);

-- 10. СТАТУСЫ ЗАКАЗОВ
CREATE TABLE IF NOT EXISTS "order_statuses" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(50) UNIQUE NOT NULL,
    "slug" VARCHAR(50) UNIQUE NOT NULL,
    "description" TEXT,
    "color" VARCHAR(20),
    "sortOrder" INTEGER DEFAULT 0 NOT NULL,
    "isFinal" BOOLEAN DEFAULT false NOT NULL
);

-- 11. ЗОНЫ ДОСТАВКИ
CREATE TABLE IF NOT EXISTS "delivery_zones" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(100) NOT NULL,
    "deliveryCost" DECIMAL(10, 2) NOT NULL,
    "minimumOrder" DECIMAL(10, 2) NOT NULL,
    "freeDeliveryFrom" DECIMAL(10, 2),
    "estimatedMinutes" INTEGER,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "sortOrder" INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "delivery_zone_polygons" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "latitude" DECIMAL(10, 8) NOT NULL,
    "longitude" DECIMAL(11, 8) NOT NULL,
    "sortOrder" INTEGER DEFAULT 0 NOT NULL,
    "zoneId" TEXT NOT NULL,
    CONSTRAINT "delivery_zone_polygons_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "delivery_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 12. СПОСОБЫ ОПЛАТЫ
CREATE TABLE IF NOT EXISTS "payment_methods" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) UNIQUE NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "sortOrder" INTEGER DEFAULT 0 NOT NULL
);

-- 13. ПРОМОКОДЫ
CREATE TABLE IF NOT EXISTS "promo_codes" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "description" TEXT,
    "type" "PromoCodeType" NOT NULL,
    "value" DECIMAL(10, 2) NOT NULL,
    "minimumOrder" DECIMAL(10, 2),
    "maxUsageCount" INTEGER,
    "usageCount" INTEGER DEFAULT 0 NOT NULL,
    "maxUsagePerUser" INTEGER,
    "activeFrom" TIMESTAMP,
    "activeTo" TIMESTAMP,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. ЗАКАЗЫ
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderNumber" VARCHAR(30) UNIQUE NOT NULL,
    "deliveryType" "DeliveryType" DEFAULT 'DELIVERY' NOT NULL,
    "addressSnapshot" TEXT,
    "comment" TEXT,
    "cutleryCount" INTEGER DEFAULT 0 NOT NULL,
    "subtotal" DECIMAL(10, 2) NOT NULL,
    "deliveryCost" DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    "discount" DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    "total" DECIMAL(10, 2) NOT NULL,
    "estimatedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "deliveryZoneId" TEXT,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "order_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "delivery_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 15. ТОВАРЫ ЗАКАЗА
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productName" VARCHAR(200) NOT NULL,
    "productImageUrl" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(10, 2) NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 16. ИСТОРИЯ СТАТУСОВ ЗАКАЗА
CREATE TABLE IF NOT EXISTS "order_status_history" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "comment" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "orderId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "changedById" TEXT,
    CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_status_history_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "order_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 17. ОПЛАТЫ
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "amount" DECIMAL(10, 2) NOT NULL,
    "status" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
    "transactionId" VARCHAR(255),
    "paidAt" TIMESTAMP,
    "failReason" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 18. ПРОМОКОДЫ ЗАКАЗА
CREATE TABLE IF NOT EXISTS "order_promos" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "discountAmount" DECIMAL(10, 2) NOT NULL,
    "orderId" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    CONSTRAINT "order_promos_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_promos_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 19. ОТЗЫВЫ
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVisible" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("userId", "productId")
);

-- 20. УВЕДОМЛЕНИЯ
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" DEFAULT 'IN_APP' NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false NOT NULL,
    "readAt" TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 21. AI-ЧАТЫ
CREATE TABLE IF NOT EXISTS "ai_chat_sessions" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "provider" "AiProvider" DEFAULT 'OPENAI' NOT NULL,
    "title" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ai_chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ai_chat_messages" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "role" "AiMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "ai_chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 22. ЖУРНАЛ ДЕЙСТВИЙ АДМИНИСТРАТОРА
CREATE TABLE IF NOT EXISTS "admin_action_logs" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "adminId" TEXT NOT NULL,
    CONSTRAINT "admin_action_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 23. НАСТРОЙКИ ПРИЛОЖЕНИЯ
CREATE TABLE IF NOT EXISTS "app_settings" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "key" VARCHAR(100) UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =============================================================================
-- ИНДЕКСЫ
-- =============================================================================

CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users"("phone");
CREATE INDEX IF NOT EXISTS "idx_users_roleId" ON "users"("roleId");
CREATE INDEX IF NOT EXISTS "idx_sessions_userId" ON "sessions"("userId");
CREATE INDEX IF NOT EXISTS "idx_products_categoryId" ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_products_slug" ON "products"("slug");
CREATE INDEX IF NOT EXISTS "idx_orders_userId" ON "orders"("userId");
CREATE INDEX IF NOT EXISTS "idx_orders_statusId" ON "orders"("statusId");
CREATE INDEX IF NOT EXISTS "idx_order_items_orderId" ON "order_items"("orderId");

-- =============================================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- =============================================================================

-- Роли
INSERT INTO "roles" ("id", "name", "description") VALUES
    (gen_random_uuid()::text, 'Пользователь', 'Обычный пользователь системы'),
    (gen_random_uuid()::text, 'Администратор', 'Администратор системы с полным доступом')
ON CONFLICT (name) DO NOTHING;

-- Статусы заказов
INSERT INTO "order_statuses" ("id", "name", "slug", "description", "color", "sortOrder", "isFinal") VALUES
    (gen_random_uuid()::text, 'Новый', 'new', 'Заказ создан, ожидает подтверждения', '#3b82f6', 1, false),
    (gen_random_uuid()::text, 'Подтверждён', 'confirmed', 'Заказ подтверждён и принят в работу', '#8b5cf6', 2, false),
    (gen_random_uuid()::text, 'Готовится', 'cooking', 'Заказ готовится на кухне', '#f59e0b', 3, false),
    (gen_random_uuid()::text, 'Передан курьеру', 'delivering', 'Заказ передан курьеру для доставки', '#06b6d4', 4, false),
    (gen_random_uuid()::text, 'Доставлен', 'delivered', 'Заказ успешно доставлен', '#10b981', 5, true),
    (gen_random_uuid()::text, 'Отменён', 'cancelled', 'Заказ отменён', '#ef4444', 6, true)
ON CONFLICT (name) DO NOTHING;

-- Способы оплаты
INSERT INTO "payment_methods" ("id", "name", "slug", "description", "isActive", "sortOrder") VALUES
    (gen_random_uuid()::text, 'Наличные', 'cash', 'Оплата наличными при получении', true, 1),
    (gen_random_uuid()::text, 'Банковская карта', 'card', 'Оплата банковской картой онлайн', true, 2),
    (gen_random_uuid()::text, 'FinikPay', 'finikpay', 'Оплата через FinikPay', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- ГОТОВО!
-- =============================================================================

-- Проверка созданных ролей
SELECT * FROM roles;
