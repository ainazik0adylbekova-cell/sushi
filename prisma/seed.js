const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Создаем роли
  const userRole = await prisma.role.upsert({
    where: { name: "Пользователь" },
    update: {},
    create: {
      name: "Пользователь",
      description: "Обычный пользователь",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "Администратор" },
    update: {},
    create: {
      name: "Администратор",
      description: "Администратор системы",
    },
  });

  console.log("✅ Роли созданы:", { userRole, adminRole });

  console.log("🎉 Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });