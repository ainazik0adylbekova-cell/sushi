import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    console.log("[INIT-ROLES] Инициализация ролей...");

    // Создаём роль "Пользователь"
    const userRole = await prisma.role.upsert({
      where: { name: "Пользователь" },
      update: {},
      create: {
        name: "Пользователь",
        description: "Обычный пользователь системы",
      },
    });
    console.log("[INIT-ROLES] Роль 'Пользователь':", userRole.id);

    // Создаём роль "Администратор"
    const adminRole = await prisma.role.upsert({
      where: { name: "Администратор" },
      update: {},
      create: {
        name: "Администратор",
        description: "Администратор системы с полным доступом",
      },
    });
    console.log("[INIT-ROLES] Роль 'Администратор':", adminRole.id);

    // Проверяем все роли в БД
    const allRoles = await prisma.role.findMany();
    console.log("[INIT-ROLES] Все роли в БД:", allRoles);

    return NextResponse.json({
      success: true,
      message: "Роли успешно инициализированы",
      roles: allRoles,
    });
  } catch (error) {
    console.error("[INIT-ROLES] Ошибка:", error);
    return NextResponse.json(
      {
        error: "Ошибка инициализации ролей",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allRoles = await prisma.role.findMany();
    return NextResponse.json({
      success: true,
      roles: allRoles,
    });
  } catch (error) {
    console.error("[INIT-ROLES] Ошибка:", error);
    return NextResponse.json(
      {
        error: "Ошибка получения ролей",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
