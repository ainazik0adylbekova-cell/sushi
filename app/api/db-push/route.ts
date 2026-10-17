import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    console.log("[DB-SETUP] Проверка и создание таблицы roles...");

    // Создаём таблицу roles если её нет
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
      );
    `;

    console.log("[DB-SETUP] Создание базовых ролей...");

    // Вставляем роли
    await prisma.$executeRaw`
      INSERT INTO roles (id, name, description)
      VALUES 
        (gen_random_uuid()::text, 'Пользователь', 'Обычный пользователь системы'),
        (gen_random_uuid()::text, 'Администратор', 'Администратор системы с полным доступом')
      ON CONFLICT (name) DO NOTHING;
    `;

    const roles = await prisma.$queryRaw`SELECT * FROM roles`;
    console.log("[DB-SETUP] Роли в базе:", roles);

    return NextResponse.json({
      success: true,
      message: "Таблица roles создана и инициализирована",
      roles: roles,
    });
  } catch (error: any) {
    console.error("[DB-SETUP] Ошибка:", error);
    return NextResponse.json(
      {
        error: "Ошибка настройки базы данных",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
