/**
 * Скрипт инициализации базовых ролей
 * Запуск: npx tsx scripts/init-roles.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Инициализация ролей...");

  // Создаём роль "Пользователь"
  const userRole = await prisma.role.upsert({
    where: { name: "Пользователь" },
    update: {},
    create: {
      name: "Пользователь",
      description: "Обычный пользователь системы",
    },
  });
  console.log("✅ Роль 'Пользователь':", userRole.id);

  // Создаём роль "Администратор"
  const adminRole = await prisma.role.upsert({
    where: { name: "Администратор" },
    update: {},
    create: {
      name: "Администратор",
      description: "Администратор системы с полным доступом",
    },
  });
  console.log("✅ Роль 'Администратор':", adminRole.id);

  console.log("✨ Роли успешно инициализированы!");
}

main()
  .catch((error) => {
    console.error("❌ Ошибка:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
