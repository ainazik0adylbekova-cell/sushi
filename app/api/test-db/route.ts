import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    console.log("[TEST-DB] Проверка подключения к БД...");

    // Проверяем подключение
    await prisma.$connect();
    console.log("[TEST-DB] ✅ Подключение успешно");

    // Получаем все роли
    const roles = await prisma.role.findMany();
    console.log("[TEST-DB] Найдено ролей:", roles.length);

    // Получаем количество пользователей
    const userCount = await prisma.user.count();
    console.log("[TEST-DB] Пользователей в БД:", userCount);

    return NextResponse.json({
      success: true,
      message: "База данных работает!",
      data: {
        roles: roles,
        userCount: userCount,
        prismaVersion: "6.8.2"
      }
    });
  } catch (error: any) {
    console.error("[TEST-DB] ❌ Ошибка:", error);
    return NextResponse.json(
      {
        error: "Ошибка подключения к базе данных",
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
