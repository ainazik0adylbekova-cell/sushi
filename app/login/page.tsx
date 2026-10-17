"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, Loader2 } from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { useAuth } from "../providers/AuthProvider";

// Логотип суши
function SushiLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="17" cy="17" r="15" stroke="var(--brand)" strokeWidth="2.5" />
      <line x1="8" y1="27" x2="24" y2="7" stroke="#b5883a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="7" r="2" fill="#2a2a2a" />
      <line x1="11" y1="29" x2="27" y2="9" stroke="#b5883a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="27" cy="9" r="2" fill="#2a2a2a" />
      <circle cx="17" cy="18" r="7" fill="#f0ede6" />
      <circle cx="17" cy="18" r="4.5" fill="var(--brand)" />
      <ellipse cx="19" cy="16" rx="2" ry="1.4" fill="#6ab04c" />
    </svg>
  );
}

// Google иконка
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// Разделитель
function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span className="text-xs font-medium" style={{ color: "var(--fg-muted)" }}>или</span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

// Главная страница входа
function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, register, user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<"login" | "register">(
    params.get("tab") === "register" ? "register" : "login"
  );

  // Форма входа
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Форма регистрации
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConf, setShowRegConf] = useState(false);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Google
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  useEffect(() => {
    const err = params.get("error");
    if (err === "google_denied") setGoogleError("Вы отменили вход через Google");
    else if (err === "google_config") setGoogleError("Вход через Google недоступен");
    else if (err === "google_failed") setGoogleError("Не удалось войти через Google");
  }, [params]);

  // Редирект если уже залогинен
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  // Вход
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim()) {
      setLoginError("Введите email");
      return;
    }

    if (!loginPassword) {
      setLoginError("Введите пароль");
      return;
    }

    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);

    if (result.error) {
      setLoginError(result.error);
    } else {
      router.push("/");
    }
  }

  // Регистрация
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");

    if (!regName.trim()) {
      setRegError("Введите имя");
      return;
    }

    if (!regEmail.trim()) {
      setRegError("Введите email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegError("Некорректный email");
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegError("Пароль должен содержать минимум 6 символов");
      return;
    }

    if (regPassword !== regConfirm) {
      setRegError("Пароли не совпадают");
      return;
    }

    setRegLoading(true);
    const result = await register(regName, regEmail, regPassword, regPhone);
    setRegLoading(false);

    if (result.error) {
      setRegError(result.error);
    } else {
      router.push("/");
    }
  }

  // Google вход
  function handleGoogle() {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google";
  }

  if (authLoading) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--bg)" }}>
        
        {/* Декорация фона */}
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute rounded-full" style={{
            width: 480, height: 480, top: "-10%", right: "-8%",
            background: "var(--brand-light)", opacity: 0.5, filter: "blur(80px)"
          }} />
          <div className="absolute rounded-full" style={{
            width: 360, height: 360, bottom: "5%", left: "-6%",
            background: "var(--brand-light)", opacity: 0.4, filter: "blur(80px)"
          }} />
        </div>

        {/* Карточка */}
        <div className="relative w-full max-w-md" style={{ zIndex: 1 }}>
          <div className="rounded-3xl p-7 sm:p-9" style={{
            background: "var(--bg-card)",
            border: "1.5px solid var(--border)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.10)"
          }}>
            
            {/* Логотип */}
            <div className="flex flex-col items-center gap-1.5 mb-6">
              <SushiLogo size={44} />
              <span className="text-base font-black tracking-tight" style={{ color: "var(--fg)" }}>
                Суши<span style={{ color: "var(--brand)" }}>Жейм</span>
              </span>
            </div>

            {/* Переключатель табов */}
            <div className="flex rounded-2xl p-1 mb-6" style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }}>
              <button
                onClick={() => { setTab("login"); setLoginError(""); setRegError(""); }}
                className="flex-1 h-9 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: tab === "login" ? "var(--bg-card)" : "transparent",
                  color: tab === "login" ? "var(--brand)" : "var(--fg-muted)",
                  boxShadow: tab === "login" ? "0 2px 8px rgba(0,0,0,0.08)" : "none"
                }}
              >
                Войти
              </button>
              <button
                onClick={() => { setTab("register"); setLoginError(""); setRegError(""); }}
                className="flex-1 h-9 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: tab === "register" ? "var(--bg-card)" : "transparent",
                  color: tab === "register" ? "var(--brand)" : "var(--fg-muted)",
                  boxShadow: tab === "register" ? "0 2px 8px rgba(0,0,0,0.08)" : "none"
                }}
              >
                Регистрация
              </button>
            </div>

            {/* Google ошибка */}
            {googleError && (
              <div className="mb-4 p-3 rounded-xl text-sm font-semibold text-center" style={{
                background: "#ef444415", color: "#ef4444", border: "1px solid #ef444430"
              }}>
                {googleError}
              </div>
            )}

            {/* ВХОД */}
            {tab === "login" && (
              <div>
                <div className="mb-5">
                  <h1 className="text-xl font-black" style={{ color: "var(--fg)" }}>С возвращением!</h1>
                  <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    Войдите в аккаунт, чтобы продолжить
                  </p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 rounded-xl text-sm font-semibold text-center" style={{
                    background: "#ef444415", color: "#ef4444", border: "1px solid #ef444430"
                  }}>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--fg-sub)" }}>
                      Email <span style={{ color: "var(--brand)" }}>*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 pl-10 pr-4 rounded-xl text-sm outline-none w-full"
                        style={{
                          background: "var(--bg-section)",
                          border: "1.5px solid var(--border)",
                          color: "var(--fg)"
                        }}
                      />
                    </div>
                  </div>

                  {/* Пароль */}
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--fg-sub)" }}>
                      Пароль <span style={{ color: "var(--brand)" }}>*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
                      <input
                        type={showLoginPass ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Введите пароль"
                        className="h-11 pl-10 pr-11 rounded-xl text-sm outline-none w-full"
                        style={{
                          background: "var(--bg-section)",
                          border: "1.5px solid var(--border)",
                          color: "var(--fg)"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="h-12 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all mt-1"
                    style={{ background: "var(--brand)" }}
                  >
                    {loginLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Входим...</>
                    ) : (
                      <>Войти<ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <Divider />

                <button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full h-11 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold transition-all"
                  style={{
                    background: "var(--bg-card)",
                    border: "1.5px solid var(--border)",
                    color: "var(--fg-sub)"
                  }}
                >
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                  <span>{googleLoading ? "Подключение..." : "Продолжить с Google"}</span>
                </button>

                <p className="mt-5 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
                  Нет аккаунта?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="font-bold"
                    style={{ color: "var(--brand)" }}
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </div>
            )}

            {/* РЕГИСТРАЦИЯ */}
            {tab === "register" && (
              <div>
                <div className="mb-5">
                  <h1 className="text-xl font-black" style={{ color: "var(--fg)" }}>Создать аккаунт</h1>
                  <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    Зарегистрируйтесь, чтобы делать заказы быстрее
                  </p>
                </div>

                {regError && (
                  <div className="mb-4 p-3 rounded-xl text-sm font-semibold text-center" style={{
                    background: "#ef444415", color: "#ef4444", border: "1px solid #ef444430"
                  }}>
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                  {/* Имя */}
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--fg-sub)" }}>
                      Имя <span style={{ color: "var(--brand)" }}>*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ваше имя"
                        className="h-11 pl-10 pr-4 rounded-xl text-sm outline-none w-full"
                        style={{
                          background: "var(--bg-section)",
                          border: "1.5px solid var(--border)",
                          color: "var(--fg)"
                        }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--fg-sub)" }}>
                      Email <span style={{ color: "var(--brand)" }}>*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 pl-10 pr-4 rounded-xl text-sm outline-none w-full"
                        style={{
                          background: "var(--bg-section)",
                          border: "1.5px solid var(--border)",
                          color: "var(--fg)"
                        }}
                      />
                    </div>
                  </div>

                  {/* Телефон */}
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--fg-sub)" }}>
                      Телефон
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+996 500 000 000"
                        className="h-11 pl-10 pr-4 rounded-xl text-sm outline-none w-full"
                        style={{
                          background: "var(--bg-section)",
                          border: "1.5px solid var(--border)",
                          color: "var(--fg)"
                        }}
                      />
                    </div>
                  </div>

                  {/* Пароль */}
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--fg-sub)" }}>
                      Пароль <span style={{ color: "var(--brand)" }}>*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
                      <input
                        type={showRegPass ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Минимум 6 символов"
                        className="h-11 pl-10 pr-11 rounded-xl text-sm outline-none w-full"
                        style={{
                          background: "var(--bg-section)",
                          border: "1.5px solid var(--border)",
                          color: "var(--fg)"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass(!showRegPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Подтверждение пароля */}
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--fg-sub)" }}>
                      Подтверждение пароля <span style={{ color: "var(--brand)" }}>*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
                      <input
                        type={showRegConf ? "text" : "password"}
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        placeholder="Повторите пароль"
                        className="h-11 pl-10 pr-11 rounded-xl text-sm outline-none w-full"
                        style={{
                          background: "var(--bg-section)",
                          border: "1.5px solid var(--border)",
                          color: "var(--fg)"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConf(!showRegConf)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {showRegConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="h-12 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all mt-1"
                    style={{ background: "var(--brand)" }}
                  >
                    {regLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Создаём аккаунт...</>
                    ) : (
                      <>Зарегистрироваться<ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <Divider />

                <button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full h-11 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold transition-all"
                  style={{
                    background: "var(--bg-card)",
                    border: "1.5px solid var(--border)",
                    color: "var(--fg-sub)"
                  }}
                >
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                  <span>{googleLoading ? "Подключение..." : "Продолжить с Google"}</span>
                </button>

                <p className="mt-5 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
                  Уже есть аккаунт?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="font-bold"
                    style={{ color: "var(--brand)" }}
                  >
                    Войти
                  </button>
                </p>
              </div>
            )}

          </div>

          {/* Нижняя декорация */}
          <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand)" }} />
            <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
              Суши Жейм — доставка паназиатской кухни
            </span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand)" }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Экспорт с Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
