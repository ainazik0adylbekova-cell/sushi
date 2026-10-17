"use client";

import FinikPayButton from "./FinikPayButton";

/**
 * Пример использования компонента FinikPayButton
 * Этот файл можно использовать как справочник для интеграции
 */
export default function FinikPayExample() {
  // Пример ID заказа (в реальном приложении берётся из БД)
  const exampleOrderId = "order-123";

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: "var(--fg)" }}>
        Примеры использования Finik Pay
      </h2>

      {/* Пример 1: Базовое использование */}
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--fg)" }}>
          1. Базовое использование
        </h3>
        <FinikPayButton
          orderId={exampleOrderId}
          orderDescription="Оплата заказа суши"
        />
      </div>

      {/* Пример 2: С callback-функциями */}
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--fg)" }}>
          2. С обработчиками событий
        </h3>
        <FinikPayButton
          orderId={exampleOrderId}
          orderDescription="Оплата заказа"
          onSuccess={() => {
            console.log("Платёж успешно создан!");
            // Можно добавить логику, например, показать уведомление
          }}
          onError={(error) => {
            console.error("Ошибка платежа:", error);
            // Можно добавить логику обработки ошибки
          }}
        />
      </div>

      {/* Пример 3: Кнопка на всю ширину */}
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--fg)" }}>
          3. Кнопка на всю ширину
        </h3>
        <FinikPayButton
          orderId={exampleOrderId}
          orderDescription="Оплата заказа"
          fullWidth
        />
      </div>

      {/* Пример 4: С кастомными стилями */}
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--fg)" }}>
          4. С дополнительными классами
        </h3>
        <FinikPayButton
          orderId={exampleOrderId}
          orderDescription="Оплата заказа"
          className="shadow-lg"
          fullWidth
        />
      </div>

      {/* Информация */}
      <div
        className="p-4 rounded-xl text-sm"
        style={{ background: "var(--bg-section)", border: "1px solid var(--border)" }}
      >
        <p className="font-semibold mb-2" style={{ color: "var(--fg)" }}>
          ℹ️ Важная информация:
        </p>
        <ul className="list-disc list-inside space-y-1" style={{ color: "var(--fg-muted)" }}>
          <li>Цена фиксирована на <strong>5 сомов</strong></li>
          <li>Пользователь должен быть авторизован</li>
          <li>После нажатия происходит редирект на Finik Pay</li>
          <li>Webhook автоматически обновит статус заказа</li>
        </ul>
      </div>
    </div>
  );
}
