"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Save, Eye, EyeOff, ShoppingBag, User, Settings, LogOut } from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { useAuth } from "../providers/AuthProvider";
import { Suspense } from "react";

function ProfileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, logout, updateProfile, loading } = useAuth();

  const [activeTab, setActiveTab] = useState(params.get("tab") ?? "profile");
  const [nameVal, setNameVal]     = useState("");
  const [curPass, setCurPass]     = useState("");
  const [newPass, setNewPass]     = useState("");
  const [confPass, setConfPass]   = useState("");
  const [showCur,  setShowCur]    = useState(false);
  const [showNew,  setShowNew]    = useState(false);
  const [saving,   setSaving]     = useState(false);
  const [msg,      setMsg]        = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) setNameVal(user.name);
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} />
    </div>
  );

  async function handleSaveName() {
    if (!nameVal.trim()) return;
    setSaving(true);
    const r = await updateProfile({ name: nameVal.trim() });
    setSaving(false);
    setMsg(r.error ? { type: "err", text: r.error } : { type: "ok", text: "Имя обновлено" });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleSavePassword() {
    if (newPass !== confPass) { setMsg({ type: "err", text: "Пароли не совпадают" }); return; }
    if (newPass.length < 6)   { setMsg({ type: "err", text: "Минимум 6 символов" }); return; }
    setSaving(true);
    const r = await updateProfile({ currentPassword: curPass, newPassword: newPass });
    setSaving(false);
    if (r.error) { setMsg({ type: "err", text: r.error }); }
    else {
      setMsg({ type: "ok", text: "Пароль изменён" });
      setCurPass(""); setNewPass(""); setConfPass("");
    }
    setTimeout(() => setMsg(null), 3000);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMsg({ type: "err", text: "Файл слишком большой (макс. 2 МБ)" }); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setSaving(true);
      await updateProfile({ avatar: base64 });
      setSaving(false);
      setMsg({ type: "ok", text: "Фото обновлено" });
      setTimeout(() => setMsg(null), 3000);
    };
    reader.readAsDataURL(file);
  }

  const initials = user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const TABS = [
    { id: "profile",  icon: User,         label: "Профиль" },
    { id: "orders",   icon: ShoppingBag,  label: "Заказы" },
    { id: "settings", icon: Settings,     label: "Настройки" },
  ];

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="max-w-4xl mx-auto px-5 py-10">
          <h1 className="text-2xl font-black mb-8" style={{ color: "var(--fg)" }}>Личный кабинет</h1>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Sidebar */}
            <div className="sm:w-56 shrink-0">
              {/* Avatar card */}
              <div
                className="rounded-2xl p-5 flex flex-col items-center gap-3 mb-4"
                style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}
              >
                <div className="relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover" />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
                      style={{ background: "var(--brand)" }}
                    >
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center text-white transition-colors"
                    style={{ background: "var(--brand)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                    aria-label="Изменить фото"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: "var(--fg)" }}>{user.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>{user.email}</p>
                </div>
              </div>

              {/* Tab nav */}
              <nav className="flex flex-col gap-1">
                {TABS.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="flex items-center gap-3 h-10 px-3.5 rounded-xl text-sm font-semibold text-left transition-colors"
                    style={{
                      background: activeTab === id ? "var(--brand-light)" : "transparent",
                      color:      activeTab === id ? "var(--brand)" : "var(--fg-sub)",
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => { logout(); router.push("/"); }}
                  className="flex items-center gap-3 h-10 px-3.5 rounded-xl text-sm font-semibold mt-2 transition-colors"
                  style={{ color: "#ef4444" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#ef444410")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Выйти
                </button>
              </nav>
            </div>

            {/* Main panel */}
            <div className="flex-1">
              {/* Toast */}
              {msg && (
                <div
                  className="mb-4 p-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: msg.type === "ok" ? "#22c55e15" : "#ef444415",
                    color:      msg.type === "ok" ? "#22c55e"   : "#ef4444",
                    border:     `1px solid ${msg.type === "ok" ? "#22c55e30" : "#ef444430"}`,
                  }}
                >
                  {msg.text}
                </div>
              )}

              {/* Profile tab */}
              {activeTab === "profile" && (
                <div
                  className="rounded-2xl p-6 flex flex-col gap-5"
                  style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}
                >
                  <h2 className="font-black text-base" style={{ color: "var(--fg)" }}>Основные данные</h2>

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>Имя</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nameVal}
                        onChange={e => setNameVal(e.target.value)}
                        className="flex-1 h-10 px-3.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--brand)")}
                        onBlur={e  => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving || nameVal === user.name}
                        className="h-10 px-4 rounded-xl text-white text-sm font-bold flex items-center gap-1.5 disabled:opacity-50"
                        style={{ background: "var(--brand)" }}
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? "..." : "Сохранить"}
                      </button>
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>Email</label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="h-10 px-3.5 rounded-xl text-sm"
                      style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg-muted)" }}
                    />
                  </div>

                  {/* Avatar upload */}
                  <div>
                    <label className="text-xs font-bold block mb-2" style={{ color: "var(--fg-sub)" }}>Фото профиля</label>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold transition-colors"
                      style={{ background: "var(--brand-light)", color: "var(--brand)" }}
                    >
                      <Camera className="w-4 h-4" />
                      {user.avatar ? "Изменить фото" : "Загрузить фото"}
                    </button>
                    <p className="text-xs mt-1.5" style={{ color: "var(--fg-muted)" }}>JPG, PNG до 2 МБ</p>
                  </div>
                </div>
              )}

              {/* Orders tab */}
              {activeTab === "orders" && (
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}
                >
                  <h2 className="font-black text-base mb-4" style={{ color: "var(--fg)" }}>История заказов</h2>
                  <div className="flex flex-col items-center gap-4 py-10 text-center">
                    <ShoppingBag className="w-12 h-12" style={{ color: "var(--fg-muted)", opacity: 0.4 }} />
                    <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                      История заказов появится здесь после первого заказа
                    </p>
                  </div>
                </div>
              )}

              {/* Settings tab */}
              {activeTab === "settings" && (
                <div
                  className="rounded-2xl p-6 flex flex-col gap-5"
                  style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}
                >
                  <h2 className="font-black text-base" style={{ color: "var(--fg)" }}>Изменить пароль</h2>

                  {[
                    { label: "Текущий пароль", val: curPass, set: setCurPass, show: showCur, toggle: () => setShowCur(!showCur) },
                    { label: "Новый пароль",   val: newPass, set: setNewPass, show: showNew, toggle: () => setShowNew(!showNew) },
                    { label: "Подтвердите",    val: confPass, set: setConfPass, show: showNew, toggle: () => setShowNew(!showNew) },
                  ].map(({ label, val, set, show, toggle }) => (
                    <div key={label} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>{label}</label>
                      <div className="relative">
                        <input
                          type={show ? "text" : "password"}
                          value={val}
                          onChange={e => set(e.target.value)}
                          className="w-full h-10 px-3.5 pr-10 rounded-xl text-sm outline-none"
                          style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "var(--brand)")}
                          onBlur={e  => (e.currentTarget.style.borderColor = "var(--border)")}
                        />
                        <button
                          type="button"
                          onClick={toggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--fg-muted)" }}
                        >
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleSavePassword}
                    disabled={saving || !curPass || !newPass || !confPass}
                    className="h-11 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "var(--brand)" }}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Сохранение..." : "Сохранить пароль"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <ProfileContent />
    </Suspense>
  );
}
