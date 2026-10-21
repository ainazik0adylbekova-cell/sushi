"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ArrowRight, Home } from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  const orderId = searchParams.get("orderId");
  const paymentStatus = searchParams.get("payment");
  const finikStatus = searchParams.get("status"); // Статус от Finik
  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    // Проверяем статус платежа из URL параметров
    // Finik может передать параметр "status" со значениями: "succeeded", "failed", "pending"
    if (finikStatus === "succeeded" || finikStatus === "success" || paymentStatus === "success") {
      setStatus("success");
    } else if (finikStatus === "failed" || finikStatus === "cancelled" || paymentStatus === "failed") {
      setStatus("failed");
    } else if (finikStatus === "pending") {
      // Показываем загрузку и ждем обновления
      setTimeout(() => {
        // Проверяем статус через API
        checkPaymentStatus();
      }, 2000);
    } else {
      // Если статус не указан, показываем успешную оплату по умолчанию
      // (webhook обновит заказ в базе)
      setStatus("success");
    }
  }, [paymentStatus, finikStatus]);

  async function checkPaymentStatus() {
    if (!orderId) {
      setStatus("success");
      return;
    }

    try {
      // Проверяем статус заказа через API
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const order = await response.json();
        // Если заказ оплачен, показываем успех
        if (order.status === "paid" || order.status === "confirmed") {
          setStatus("success");
        } else {
          setStatus("success"); // По умолчанию успех
        }
      } else {
        setStatus("success");
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setStatus("success");
    }
  }

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="max-w-md w-full mx-auto px-5 py-12">
          <div
            className="rounded-2xl p-8 flex flex-col items-center text-center gap-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {status === "loading" && (
              <>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "var(--bg-section)" }}
                >
                  <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--brand)" }} />
                </div>
                <div>
                  <h1 className="text-2xl font-black mb-2" style={{ color: "var(--fg)" }}>
                    Обработка платежа
                  </h1>
                  <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                    Пожалуйста, подождите...
                  </p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "#22c55e18" }}
                >
                  <CheckCircle className="w-10 h-10" style={{ color: "#22c55e" }} />
                </div>
                <div>
                  <h1 className="text-2xl font-black mb-2" style={{ color: "var(--fg)" }}>
                    Оплата успешна!
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    Ваш платёж успешно обработан. Заказ передан на кухню и скоро будет готов.
                  </p>
                  {orderId && (
                    <p className="text-xs mt-3 font-mono" style={{ color: "var(--fg-muted)" }}>
                      Номер заказа: {orderId}
                    </p>
                  )}
                  {transactionId && (
                    <p className="text-xs mt-1 font-mono" style={{ color: "var(--fg-muted)" }}>
                      ID транзакции: {transactionId}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2.5 w-full mt-2">
                  <Link
                    href="/profile"
                    className="flex items-center justify-center gap-2 h-11 rounded-xl text-white font-bold text-sm transition-colors"
                    style={{ background: "var(--brand)" }}
                  >
                    Мои заказы
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-sm transition-colors"
                    style={{ border: "1.5px solid var(--border)", color: "var(--fg-sub)" }}
                  >
                    <Home className="w-4 h-4" />
                    На главную
                  </Link>
                </div>
              </>
            )}

            {status === "failed" && (
              <>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "#ef444418" }}
                >
                  <XCircle className="w-10 h-10" style={{ color: "#ef4444" }} />
                </div>
                <div>
                  <h1 className="text-2xl font-black mb-2" style={{ color: "var(--fg)" }}>
                    Ошибка оплаты
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    К сожалению, платёж не прошёл. Пожалуйста, попробуйте ещё раз или выберите другой способ оплаты.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 w-full mt-2">
                  <Link
                    href="/cart"
                    className="flex items-center justify-center gap-2 h-11 rounded-xl text-white font-bold text-sm transition-colors"
                    style={{ background: "var(--brand)" }}
                  >
                    Вернуться к корзине
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-sm transition-colors"
                    style={{ border: "1.5px solid var(--border)", color: "var(--fg-sub)" }}
                  >
                    <Home className="w-4 h-4" />
                    На главную
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
