/**
 * POST /api/admin/verify-code
 * Сверяет введённый пользователем код с тем, что хранится в cookie.
 * При успехе устанавливает сессионную cookie admin_session=1.
 */

import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { code } = await request.json() as { code?: string };

  if (!code) {
    return Response.json({ error: "Введите код" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get("admin_2fa_code")?.value;

  if (!raw) {
    return Response.json(
      { error: "Код устарел или не был запрошен. Войдите снова." },
      { status: 400 }
    );
  }

  let stored: { code: string; expires: number };
  try {
    stored = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Ошибка чтения кода" }, { status: 400 });
  }

  if (Date.now() > stored.expires) {
    cookieStore.delete("admin_2fa_code");
    return Response.json({ error: "Код истёк. Запросите новый." }, { status: 400 });
  }

  if (code.trim() !== stored.code) {
    return Response.json({ error: "Неверный код" }, { status: 400 });
  }

  // Код правильный — удаляем одноразовый код, ставим сессию
  cookieStore.delete("admin_2fa_code");
  cookieStore.set("admin_session", "1", {
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 8, // 8 часов
  });

  return Response.json({ ok: true });
}
