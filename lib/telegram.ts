/**
 * Отправка сообщений через Telegram Bot API
 * Используем встроенный fetch (Node 18+ / Next.js 16)
 */

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("[Telegram] TELEGRAM_BOT_TOKEN не задан");
    return { ok: false, error: "Bot token not configured" };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await res.json() as { ok: boolean; description?: string };

    if (!data.ok) {
      console.error("[Telegram] Ошибка API:", data.description);
      return { ok: false, error: data.description };
    }

    return { ok: true };
  } catch (err) {
    console.error("[Telegram] Сетевая ошибка:", err);
    return { ok: false, error: "Network error" };
  }
}
