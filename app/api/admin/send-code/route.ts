/**
 * POST /api/admin/send-code
 * 1. Проверяет email/пароль администратора
 * 2. Автоматически находит chat_id через getUpdates (не нужно вручную прописывать)
 * 3. Генерирует 6-значный код, сохраняет в cookie, отправляет в Telegram
 */

import { cookies } from "next/headers";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 минут

/** Получаем chat_id из последних обновлений бота */
async function getAdminChatId(token: string): Promise<string | null> {
  // Сначала пробуем из .env
  const envChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (envChatId && envChatId !== "your_chat_id_here") {
    return envChatId;
  }

  // Автоматически берём из getUpdates — последнее сообщение боту
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates?limit=10&offset=-10`,
      { cache: "no-store" }
    );
    const data = await res.json() as {
      ok: boolean;
      result: Array<{ message?: { chat: { id: number } } }>;
    };

    if (!data.ok || !data.result.length) return null;

    // Берём последнее сообщение с chat_id
    for (let i = data.result.length - 1; i >= 0; i--) {
      const chatId = data.result[i]?.message?.chat?.id;
      if (chatId) return String(chatId);
    }
  } catch {
    // ignore
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; password?: string };
  const { email, password } = body;

  const adminEmail    = process.env.ADMIN_EMAIL    ?? "admin@syshi.kg";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const token         = process.env.TELEGRAM_BOT_TOKEN ?? "";

  // Проверяем учётные данные
  if (
    !email || !password ||
    email.toLowerCase().trim() !== adminEmail.toLowerCase() ||
    password !== adminPassword
  ) {
    return Response.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  if (!token) {
    return Response.json({ error: "TELEGRAM_BOT_TOKEN не настроен" }, { status: 500 });
  }

  // Получаем chat_id
  const chatId = await getAdminChatId(token);
  if (!chatId) {
    // Telegram не настроен — разрешаем прямой вход без кода.
    // Создаём сессию сразу и возвращаем флаг bypass.
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "1", {
      httpOnly: true,
      sameSite: "lax",
      path:     "/",
      maxAge:   8 * 60 * 60, // 8 часов
    });
    return Response.json({ ok: true, bypass: true });
  }

  // Генерируем код
  const code    = String(Math.floor(100000 + Math.random() * 900000));
  const expires = Date.now() + CODE_TTL_MS;

  // Сохраняем в cookie
  const cookieStore = await cookies();
  cookieStore.set("admin_2fa_code", JSON.stringify({ code, expires }), {
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    maxAge:   CODE_TTL_MS / 1000,
  });

  // Отправляем в Telegram
  const text =
    `🔐 <b>Суши Жейм — Вход в Админку</b>\n\n` +
    `Ваш код подтверждения:\n\n` +
    `<code>${code}</code>\n\n` +
    `⏱ Код действителен 5 минут.\n` +
    `Если вы не пытались войти — смените пароль.`;

  const tgRes = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    chatId,
        text,
        parse_mode: "HTML",
      }),
    }
  );

  const tgData = await tgRes.json() as { ok: boolean; description?: string };

  if (!tgData.ok) {
    return Response.json(
      { error: `Ошибка Telegram: ${tgData.description}` },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
