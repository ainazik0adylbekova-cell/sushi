"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login:         (email: string, password: string) => Promise<{ error?: string }>;
  register:      (name: string, email: string, password: string, phone?: string) => Promise<{ error?: string }>;
  logout:        () => Promise<void>;
  updateProfile: (data: { name?: string; avatar?: string; currentPassword?: string; newPassword?: string }) => Promise<{ error?: string }>;
  refreshUser:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  // ── Fetch current session from server on mount ───────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setState({ user: data.user ?? null, loading: false });
    } catch {
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ── Login ────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error ?? "Ошибка входа" };
      setState({ user: data.user, loading: false });
      return {};
    } catch {
      return { error: "Не удалось подключиться к серверу" };
    }
  }, []);

  // ── Register ─────────────────────────────────────────────────
  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error ?? "Ошибка регистрации" };
      setState({ user: data.user, loading: false });
      return {};
    } catch {
      return { error: "Не удалось подключиться к серверу" };
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore network errors on logout
    }
    setState({ user: null, loading: false });
  }, []);

  // ── Update profile (name / avatar / password) ────────────────
  const updateProfile = useCallback(async (data: {
    name?: string;
    avatar?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) return { error: result.error ?? "Ошибка обновления профиля" };
      // Refresh user state after update
      await refreshUser();
      return {};
    } catch {
      return { error: "Не удалось подключиться к серверу" };
    }
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
