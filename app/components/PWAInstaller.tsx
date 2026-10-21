"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Регистрация Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✓ Service Worker зарегистрирован:", registration.scope);
            
            // Проверка обновлений
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // Новая версия доступна
                    console.log("✓ Доступно обновление PWA");
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("❌ Ошибка регистрации Service Worker:", error);
          });
      });
    }

    // Обработка события установки PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Проверяем, показывали ли уже промпт
      const hasSeenPrompt = localStorage.getItem("pwa-install-prompt-seen");
      if (!hasSeenPrompt) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Обработка успешной установки
    window.addEventListener("appinstalled", () => {
      console.log("✓ PWA успешно установлено");
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Показываем системный промпт установки
    deferredPrompt.prompt();

    // Ждем выбора пользователя
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("✓ Пользователь установил PWA");
    } else {
      console.log("✗ Пользователь отказался от установки");
    }

    // Скрываем наш промпт
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-install-prompt-seen", "true");
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-install-prompt-seen", "true");
  };

  if (!showInstallPrompt) return null;

  return (
    <div
      className="fixed bottom-20 left-5 right-5 z-[999] animate-slide-up"
      style={{
        animation: "slideUp 0.3s ease-out",
      }}
    >
      <div
        className="rounded-2xl p-4 shadow-2xl flex items-center gap-3 max-w-md mx-auto"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Иконка */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--brand)" }}
        >
          <Download className="w-6 h-6 text-white" />
        </div>

        {/* Текст */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--fg)" }}>
            Установить приложение
          </h3>
          <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
            Быстрый доступ с главного экрана
          </p>
        </div>

        {/* Кнопки */}
        <button
          onClick={handleInstallClick}
          className="px-4 py-2 rounded-lg font-bold text-xs text-white transition-transform active:scale-95"
          style={{ background: "var(--brand)" }}
        >
          Установить
        </button>

        <button
          onClick={handleDismiss}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
          style={{ background: "var(--bg-section)" }}
        >
          <X className="w-4 h-4" style={{ color: "var(--fg-muted)" }} />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
