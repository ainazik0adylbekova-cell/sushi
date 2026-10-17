"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

interface FinikPayButtonProps {
  orderId: string;
  orderDescription?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Компонент кнопки для оплаты через Finik Pay
 * Цена фиксирована на 5 сомов
 */
export default function FinikPayButton({
  orderId,
  orderDescription = "Оплата заказа",
  onSuccess,
  onError,
  className = "",
  fullWidth = false,
}: FinikPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FIXED_PRICE = 5; // Фиксированная цена 5 сомов

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Вызов API для создания платежа
      const response = await fetch("/api/finik/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          orderDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Не удалось создать платёж");
      }

      // 2. Редирект на платежную страницу Finik
      if (data.paymentUrl) {
        if (onSuccess) {
          onSuccess();
        }
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("URL платежа не получен");
      }
    } catch (err) {
      console.error("Ошибка оплаты через Finik:", err);
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`
          flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl
          text-white font-bold text-sm transition-all
          disabled:opacity-60 disabled:cursor-not-allowed
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        style={{
          background: isLoading ? "var(--fg-muted)" : "var(--brand)",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)";
        }}
        onMouseLeave={(e) => {
          if (!isLoading) (e.currentTarget as HTMLElement).style.background = "var(--brand)";
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Создание платежа...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>Оплатить {FIXED_PRICE} сом</span>
          </>
        )}
      </button>

      {error && (
        <p
          className="text-xs mt-2 px-3 py-2 rounded-lg"
          style={{
            color: "#ef4444",
            background: "#ef444415",
            border: "1px solid #ef444430",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
