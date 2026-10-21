"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Проверяем статус соединения
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  if (isOnline) {
    // Если соединение восстановлено, перенаправляем на главную
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-md w-full text-center">
        {/* Иконка */}
        <div
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: "var(--bg-section)" }}
        >
          <WifiOff className="w-12 h-12" style={{ color: "var(--fg-muted)" }} />
        </div>

        {/* Заголовок */}
        <h1 className="text-3xl font-black mb-3" style={{ color: "var(--fg)" }}>
          Нет подключения
        </h1>

        {/* Описание */}
        <p className="text-base mb-8 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Упс! Кажется, у вас нет интернета. Проверьте подключение и попробуйте снова.
        </p>

        {/* Кнопки */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleReload}
            className="flex items-center justify-center gap-2.5 h-12 rounded-xl text-white font-bold text-sm transition-all"
            style={{ background: "var(--brand)" }}
          >
            <RefreshCw className="w-4 h-4" />
            Попробовать снова
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2.5 h-12 rounded-xl font-semibold text-sm transition-all"
            style={{
              border: "1.5px solid var(--border)",
              color: "var(--fg-sub)",
            }}
          >
            <Home className="w-4 h-4" />
            На главную
          </Link>
        </div>

        {/* Дополнительная информация */}
        <div
          className="mt-8 p-4 rounded-xl text-left"
          style={{ background: "var(--bg-section)" }}
        >
          <h3 className="font-bold text-sm mb-2" style={{ color: "var(--fg)" }}>
            💡 Что можно сделать:
          </h3>
          <ul className="text-xs space-y-1.5" style={{ color: "var(--fg-muted)" }}>
            <li>• Проверьте Wi-Fi или мобильные данные</li>
            <li>• Включите режим полета и выключите его обратно</li>
            <li>• Перезагрузите роутер</li>
            <li>• Попробуйте открыть другой сайт</li>
          </ul>
        </div>

        {/* Кэшированные данные */}
        <p className="text-xs mt-6" style={{ color: "var(--fg-muted)" }}>
          Некоторые страницы могут быть доступны из кэша
        </p>
      </div>
    </div>
  );
}
