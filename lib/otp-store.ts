/**
 * Хранилище OTP-кодов в памяти процесса.
 * TTL — 5 минут. Максимум 3 попытки на код.
 *
 * В production при нескольких репликах лучше использовать Redis,
 * но для одного сервера/процесса этого достаточно.
 */

interface OtpEntry {
  code: string;
  expiresAt: number; // timestamp ms
  attempts: number;  // сколько раз вводили неверно
}

// Singleton Map — живёт пока жив процесс Next.js
const store = new Map<string, OtpEntry>();

const TTL_MS      = 5 * 60 * 1000; // 5 минут
const MAX_ATTEMPTS = 3;

/** Генерирует 6-значный код и сохраняет его по ключу (email или другой идентификатор) */
export function createOtp(key: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(key, {
    code,
    expiresAt: Date.now() + TTL_MS,
    attempts: 0,
  });
  return code;
}

/** Проверяет код. Возвращает: "ok" | "invalid" | "expired" | "too_many" */
export function verifyOtp(
  key: string,
  inputCode: string
): "ok" | "invalid" | "expired" | "too_many" {
  const entry = store.get(key);

  if (!entry) return "expired"; // нет записи — считаем истёкшим

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return "expired";
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    return "too_many";
  }

  if (entry.code !== inputCode.trim()) {
    entry.attempts += 1;
    return "invalid";
  }

  // Успех — удаляем, чтобы нельзя было использовать повторно
  store.delete(key);
  return "ok";
}

/** Удаляет OTP (например, при явном выходе или повторном запросе) */
export function deleteOtp(key: string): void {
  store.delete(key);
}
