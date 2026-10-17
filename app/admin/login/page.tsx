"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Send, KeyRound, ArrowLeft } from "lucide-react";

type Step = "credentials" | "code";

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep]           = useState<Step>("credentials");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [code, setCode]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  /* ── Шаг 1: проверить логин/пароль и отправить код ── */
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Заполните все поля");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/send-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Ошибка отправки кода");
      } else {
        setStep("code");
      }
    } catch {
      setError("Сетевая ошибка. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Шаг 2: проверить код ── */
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.trim().length !== 6) {
      setError("Код должен содержать 6 цифр");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Неверный код");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Сетевая ошибка. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 sm:p-10"
        style={{
          background:  "var(--bg-card)",
          border:      "1.5px solid var(--border)",
          boxShadow:   "0 8px 40px rgba(0,0,0,0.10)",
        }}
      >
        {/* Логотип */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "var(--brand-light)" }}
          >
            🍣
          </div>
          <h1 className="text-2xl font-black" style={{ color: "var(--fg)" }}>
            Суши <span style={{ color: "var(--brand)" }}>Жейм</span>
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--fg-muted)" }}>
            Панель администратора
          </p>
        </div>

        {/* Индикатор шагов */}
        <div className="flex items-center gap-2 mb-6">
          {(["credentials", "code"] as Step[]).map((s, i) => {
            const active  = step === s;
            const done    = step === "code" && s === "credentials";
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2"
                  style={{
                    background: active ? "var(--brand-light)" : done ? "#e8fdf0" : "var(--bg-section)",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{
                      background: active ? "var(--brand)" : done ? "#22c55e" : "var(--border)",
                      color:      active || done ? "#fff" : "var(--fg-muted)",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: active ? "var(--brand)" : done ? "#22c55e" : "var(--fg-muted)" }}
                  >
                    {s === "credentials" ? "Логин" : "Telegram код"}
                  </span>
                </div>
                {i === 0 && (
                  <div
                    className="w-6 h-0.5 shrink-0 rounded-full"
                    style={{ background: step === "code" ? "#22c55e" : "var(--border)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Ошибка */}
        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm font-semibold text-center"
            style={{ background: "#ef444415", color: "#ef4444", border: "1px solid #ef444430" }}
          >
            {error}
          </div>
        )}

        {/* ── Шаг 1: логин/пароль ── */}
        {step === "credentials" && (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>
                Email <span style={{ color: "var(--brand)" }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@syshi.kg"
                autoComplete="email"
                className="h-11 px-4 rounded-xl text-sm outline-none w-full"
                style={{
                  background: "var(--bg-section)",
                  border:     "1.5px solid var(--border)",
                  color:      "var(--fg)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>
                Пароль <span style={{ color: "var(--brand)" }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 px-4 pr-11 rounded-xl text-sm outline-none w-full"
                  style={{
                    background: "var(--bg-section)",
                    border:     "1.5px solid var(--border)",
                    color:      "var(--fg)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--fg-muted)" }}
                  aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60 transition-colors"
              style={{ background: "var(--brand)" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}
            >
              <Send className="w-4 h-4" />
              {loading ? "Отправляем код..." : "Получить код в Telegram"}
            </button>
          </form>
        )}

        {/* ── Шаг 2: код из Telegram ── */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <div
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }}
            >
              <span className="text-2xl shrink-0">✈️</span>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--fg)" }}>
                  Код отправлен в Telegram
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                  Откройте бота <b>@sushi_jeim_bot</b> и введите 6-значный код.
                  Код действует 5 минут.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>
                Код подтверждения <span style={{ color: "var(--brand)" }}>*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                className="h-14 px-4 rounded-xl text-2xl font-black text-center tracking-[0.5em] outline-none w-full"
                style={{
                  background:  "var(--bg-section)",
                  border:      "1.5px solid var(--border)",
                  color:       "var(--fg)",
                  letterSpacing: "0.4em",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="h-12 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 mt-1 disabled:opacity-60 transition-colors"
              style={{ background: "var(--brand)" }}
              onMouseEnter={(e) => { if (!loading && code.length === 6) (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}
            >
              <KeyRound className="w-4 h-4" />
              {loading ? "Проверяем..." : "Войти в админку"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("credentials"); setCode(""); setError(""); }}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold"
              style={{ color: "var(--fg-muted)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ввести другой логин/пароль
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
