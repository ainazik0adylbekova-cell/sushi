/**
 * POST /api/admin/login
 *
 * Шаг 1 из 2: проверяем email + пароль.
 * При успехе генерируем OTP, отправляем в Telegram и возвращаем { step: "otp" }.
 * Код НЕ возвращается в ответе — только через Telegram.
 */

import { createOtp } from "@/lib/otp-store";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; password?: string };
  const { email, password } = body;

  if (!email || !password) {
    return Response.json(
      { error: "Email и пароль обязательны" },
      { status: 400 }
    );
  }

  // Сравниваем с переменными окружения (demo-режим без БД)
  const adminEmail    = process.env.ADMIN_EMAIL    ?? "admin@syshi.kg";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  const emailMatch    = email.trim().toLowerCase() === adminEmail.toLowerCase();
  const passwordMatch = password === adminPassword;

  if (!emailMatch || !passwordMatch) {
    // Одинаковое сообщение — не раскрываем, что именно неверно
    return Response.json(
      { error: "Неверный email или пароль" },
      { status: 401 }
    );
  }

  // Генерируем OTP и отправляем в Telegram
  const code   = createOtp(adminEmail);
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID ?? "";

  if (!chatId) {
    console.error("[admin/login] TELEGRAM_ADMIN_CHAT_ID не задан");
    return Response.json(
      { error: "Telegram Chat ID не настроен. Проверьте переменные окружения." },
      { status: 500 }
    );
  }

  const now  = new Date().toLocaleString("ru-RU", { timeZone: "Asia/Bishkek" });
  const text = [
    "🔐 <b>Суши Жейм — Вход в админку</b>",
    "",
    `Кто-то пытается войти как <b>${adminEmail}</b>`,
    `🕐 ${now}`,
    "",
    `Ваш код: <code>${code}</code>`,
    "",
    "⏱ Код действителен <b>5 минут</b>.",
    "Если это не вы — немедленно смените пароль.",
  ].join("\n");

  const result = await sendTelegramMessage(chatId, text);

  if (!result.ok) {
    return Response.json(
      { error: `Не удалось отправить код в Telegram: ${result.error}` },
      { status: 502 }
    );
  }

  return Response.json({ step: "otp" });
}
