/**
 * POST /api/admin/verify-otp
 *
 * Шаг 2 из 2: проверяем OTP-код.
 * При успехе устанавливаем httpOnly-куку admin_session=1 и возвращаем { ok: true }.
 *
 * Кука используется admin layout для проверки — лёгкий токен без JWT-библиотек.
 * В production замените значение на подписанный JWT или случайный токен из Redis.
 */

import { verifyOtp } from "@/lib/otp-store";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Время жизни сессии: 8 часов
const SESSION_MAX_AGE = 8 * 60 * 60;

const ERROR_MESSAGES: Record<string, string> = {
  invalid:   "Неверный код. Попробуйте ещё раз.",
  expired:   "Код истёк. Вернитесь и запросите новый.",
  too_many:  "Слишком много попыток. Вернитесь и запросите новый код.",
};

export async function POST(request: Request) {
  const body = await request.json() as { code?: string };
  const code = body.code?.trim() ?? "";

  if (!code || !/^\d{6}$/.test(code)) {
    return Response.json(
      { error: "Введите 6-значный цифровой код" },
      { status: 400 }
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@syshi.kg";
  const result     = verifyOtp(adminEmail, code);

  if (result !== "ok") {
    return Response.json(
      { error: ERROR_MESSAGES[result] ?? "Ошибка проверки кода" },
      { status: 401 }
    );
  }

  // Устанавливаем сессионную куку
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "1", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   SESSION_MAX_AGE,
    path:     "/",
  });

  return Response.json({ ok: true });
}
