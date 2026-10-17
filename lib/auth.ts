/**
 * lib/auth.ts
 * JWT session helpers + cookie management for user auth.
 *
 * Actual DB (generated Prisma client) uses:
 *   User { id: uuid string, name, email?, phone?, password?, roleId: string }
 *   Role { id: uuid string, name: string ("Пользователь" | "Администратор") }
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const SESSION_COOKIE = "syshi_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  userId: string;  // User.id — uuid string
  name:   string;
  email:  string;
  avatar?: string; // from Google OAuth, stored in JWT only
  role:   string;  // "Пользователь" | "Администратор"
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "fallback_dev_secret_change_in_prod";
  return new TextEncoder().encode(secret);
}

export async function signJwt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyJwt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signJwt(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   0,
  });
}

export function buildGoogleAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!clientId || clientId.includes("your_google")) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  `${appUrl}/api/auth/google/callback`,
    response_type: "code",
    scope:         "openid email profile",
    access_type:   "offline",
    prompt:        "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<{ access_token: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  `${appUrl}/api/auth/google/callback`,
      grant_type:    "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("Failed to exchange Google code");
  return res.json();
}

export async function fetchGoogleUser(accessToken: string): Promise<{
  sub: string; name: string; email: string; picture?: string;
}> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google user info");
  return res.json();
}

/**
 * Проверяет авторизацию пользователя из NextRequest
 * Возвращает сессию пользователя или null
 */
export async function verifyAuth(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyJwt(token);
}
