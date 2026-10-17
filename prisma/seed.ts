/**
 * prisma/seed.ts
 * Наполняет базу данных демо-данными для презентации проекта.
 * Запуск: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Белофоновые фото Unsplash (всегда доступны) ───────────────────────────
const IMG = {
  philadelphia: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&h=450&q=90&auto=format&fit=crop",
  california:   "https://images.unsplash.com/photo-1617196034099-e66a539bad0c?w=600&h=450&q=90&auto=format&fit=crop",
  dragon:       "https://images.unsplash.com/photo-1617196034302-a5f1ccbbd1f2?w=600&h=450&q=90&auto=format&fit=crop",
  tempura:      "https://images.unsplash.com/photo-1617196035018-30a7c4ec3efe?w=600&h=450&q=90&auto=format&fit=crop",
  rainbow:      "https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&h=450&q=90&auto=format&fit=crop",
  salmonNigiri: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&h=450&q=90&auto=format&fit=crop",
  tunaNigiri:   "https://images.unsplash.com/photo-1640671894829-e3fd79ccb0f9?w=600&h=450&q=90&auto=format&fit=crop",
  eelNigiri:    "https://images.unsplash.com/photo-1617196035230-7de38fc4dc23?w=600&h=450&q=90&auto=format&fit=crop",
  bigSet:       "https://images.unsplash.com/photo-1617196035902-e1ec63093e8f?w=600&h=450&q=90&auto=format&fit=crop",
  classicSet:   "https://images.unsplash.com/photo-1617196035672-c39d0b44fae4?w=600&h=450&q=90&auto=format&fit=crop",
  tomYam:       "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=450&q=90&auto=format&fit=crop",
  ramen:        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=450&q=90&auto=format&fit=crop",
  wokChicken:   "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=450&q=90&auto=format&fit=crop",
  wokBeef:      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=450&q=90&auto=format&fit=crop",
  gyoza:        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=450&q=90&auto=format&fit=crop",
  edamame:      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&q=90&auto=format&fit=crop",
  matcha:       "https://images.unsplash.com/photo-1515823662972-da6a2e4d3d18?w=600&h=450&q=90&auto=format&fit=crop",
  lemonade:     "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=450&q=90&auto=format&fit=crop",
};

async function main() {
  console.log("🌱 Начинаем сидирование базы данных...\n");

  // ── 1. Роли ───────────────────────────────────────────────────────────────
  console.log("Создаём роли...");
  const roleUser = await prisma.role.upsert({
    where:  { name: "user" },
    update: {},
    create: { name: "user",  description: "Обычный пользователь" },
  });
  const roleAdmin = await prisma.role.upsert({
    where:  { name: "admin" },
    update: {},
    create: { name: "admin", description: "Администратор" },
  });
  console.log("  ✓ user, admin");

  // ── 2. Демо-пользователи ──────────────────────────────────────────────────
  console.log("Создаём пользователей...");
  const passwordHash = await bcrypt.hash("demo123", 12);

  await prisma.user.upsert({
    where:  { email: "admin@syshi.kg" },
    update: {},
    create: {
      name: "Администратор", email: "admin@syshi.kg",
      password: await bcrypt.hash("admin123", 12),
      roleId: roleAdmin.id, isActive: true, isVerified: true,
    },
  });

  const demoUsers = [
    { name: "Айдана Асанова",    email: "aidana@mail.kg",    phone: "+996700111222" },
    { name: "Нурбек Усупов",     email: "nurbek@gmail.com",  phone: "+996555234567" },
    { name: "Бекзат Кадыров",    email: "bekzat@mail.ru",    phone: "+996700345678" },
    { name: "Айпери Жакыпова",   email: "aiperi@inbox.ru",   phone: "+996312456789" },
    { name: "Азамат Сатылганов", email: "azamat@gmail.com",  phone: "+996700567890" },
  ];
  for (const u of demoUsers) {
    await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: { ...u, password: passwordHash, roleId: roleUser.id, isActive: true, isVerified: true },
    });
  }
  console.log("  ✓ 6 пользователей (1 admin + 5 клиентов)");

  // ── 3. Категории ──────────────────────────────────────────────────────────
  console.log("Создаём категории...");
  const categories = [
    { name: "Роллы",       slug: "rolls",   sortOrder: 1, description: "Классические и авторские роллы" },
    { name: "Суши",        slug: "sushi",   sortOrder: 2, description: "Традиционные нигири и другие суши" },
    { name: "Сеты",        slug: "sets",    sortOrder: 3, description: "Готовые наборы для компании" },
    { name: "Горячее",     slug: "hot",     sortOrder: 4, description: "Горячие блюда паназиатской кухни" },
    { name: "Лапша / Вок", slug: "noodles", sortOrder: 5, description: "Лапша и блюда вок" },
    { name: "Закуски",     slug: "snacks",  sortOrder: 6, description: "Закуски и снеки" },
    { name: "Напитки",     slug: "drinks",  sortOrder: 7, description: "Горячие и холодные напитки" },
  ];
  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where:  { slug: c.slug },
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder, isActive: true },
      create: { ...c, isActive: true },
    });
    catMap[c.slug] = cat.id;
  }
  console.log(`  ✓ ${categories.length} категорий`);

  // ── 4. Теги ───────────────────────────────────────────────────────────────
  console.log("Создаём теги...");
  const tags = [
    { name: "Хит",     color: "#f97316" },
    { name: "Топ",     color: "#ef4444" },
    { name: "Выгодно", color: "#f59e0b" },
    { name: "Новинка", color: "#22c55e" },
    { name: "Острое",  color: "#dc2626" },
  ];
  const tagMap: Record<string, string> = {};
  for (const t of tags) {
    const tag = await prisma.tag.upsert({
      where:  { name: t.name },
      update: { color: t.color },
      create: t,
    });
    tagMap[t.name] = tag.id;
  }
  console.log("  ✓ 5 тегов");

  // ── 5. Товары + изображения ───────────────────────────────────────────────
  console.log("Создаём товары...");

  type ProductSeed = {
    name: string; slug: string; description: string; ingredients: string;
    price: number; discountPrice?: number; weight: number; piecesCount?: number;
    isAvailable: boolean; isPopular: boolean; sortOrder: number;
    categorySlug: string; image: string; tags: string[];
  };

  const products: ProductSeed[] = [
    // ── Роллы ──
    {
      name: "Ролл Филадельфия", slug: "roll-philadelphia",
      description: "Классический ролл с нежным лососем и сливочным сыром",
      ingredients: "Лосось, сливочный сыр Philadelphia, огурец, авокадо, рис, нори",
      price: 490, weight: 260, piecesCount: 8,
      isAvailable: true, isPopular: true, sortOrder: 1,
      categorySlug: "rolls", image: IMG.philadelphia, tags: ["Хит"],
    },
    {
      name: "Ролл Калифорния", slug: "roll-california",
      description: "Ролл снаружи с тобико, внутри — краб и авокадо",
      ingredients: "Краб, авокадо, огурец, тобико, рис, нори",
      price: 440, weight: 240, piecesCount: 8,
      isAvailable: true, isPopular: true, sortOrder: 2,
      categorySlug: "rolls", image: IMG.california, tags: ["Топ"],
    },
    {
      name: "Ролл Дракон", slug: "roll-dragon",
      description: "Авторский ролл с угрём и авокадо под соусом унаги",
      ingredients: "Угорь, авокадо, огурец, тобико, соус унаги, рис, нори",
      price: 540, weight: 280, piecesCount: 8,
      isAvailable: true, isPopular: true, sortOrder: 3,
      categorySlug: "rolls", image: IMG.dragon, tags: ["Топ"],
    },
    {
      name: "Ролл Темпура", slug: "roll-tempura",
      description: "Ролл с хрустящей креветкой темпура и сливочным сыром",
      ingredients: "Креветка темпура, огурец, сливочный сыр, икра тобико, рис, нори",
      price: 460, weight: 250, piecesCount: 8,
      isAvailable: true, isPopular: false, sortOrder: 4,
      categorySlug: "rolls", image: IMG.tempura, tags: [],
    },
    {
      name: "Ролл Радуга", slug: "roll-rainbow",
      description: "Калифорния накрытая ассорти из лосося, тунца и авокадо",
      ingredients: "Лосось, тунец, авокадо, краб, огурец, тобико, рис, нори",
      price: 580, weight: 300, piecesCount: 8,
      isAvailable: true, isPopular: true, sortOrder: 5,
      categorySlug: "rolls", image: IMG.rainbow, tags: ["Хит"],
    },
    // ── Суши ──
    {
      name: "Суши с лососем", slug: "sushi-salmon",
      description: "Классические нигири со свежим лососем атлантик",
      ingredients: "Свежий лосось, рис, васаби, имбирь",
      price: 165, weight: 70, piecesCount: 2,
      isAvailable: true, isPopular: true, sortOrder: 1,
      categorySlug: "sushi", image: IMG.salmonNigiri, tags: [],
    },
    {
      name: "Суши с тунцом", slug: "sushi-tuna",
      description: "Нигири с нежным тунцом и традиционным соусом",
      ingredients: "Свежий тунец, рис, соевый соус",
      price: 175, weight: 70, piecesCount: 2,
      isAvailable: true, isPopular: false, sortOrder: 2,
      categorySlug: "sushi", image: IMG.tunaNigiri, tags: [],
    },
    {
      name: "Суши с угрём", slug: "sushi-eel",
      description: "Нигири с копчёным угрём и сладковатым соусом унаги",
      ingredients: "Копчёный угорь, рис, соус унаги",
      price: 190, weight: 75, piecesCount: 2,
      isAvailable: true, isPopular: false, sortOrder: 3,
      categorySlug: "sushi", image: IMG.eelNigiri, tags: ["Хит"],
    },
    // ── Сеты ──
    {
      name: "Сет «Жейм»", slug: "set-jeim",
      description: "Наш фирменный большой набор — лучшие роллы одним заказом",
      ingredients: "Ролл Филадельфия 8 шт, Ролл Калифорния 8 шт, Ролл Дракон 8 шт, Ролл Темпура 8 шт",
      price: 1290, discountPrice: 1490, weight: 960, piecesCount: 32,
      isAvailable: true, isPopular: true, sortOrder: 1,
      categorySlug: "sets", image: IMG.bigSet, tags: ["Выгодно"],
    },
    {
      name: "Сет «Классика»", slug: "set-classic",
      description: "Проверенные временем роллы для дружеской встречи",
      ingredients: "Ролл Филадельфия 8 шт, Ролл Калифорния 8 шт, Ролл Радуга 8 шт",
      price: 990, weight: 720, piecesCount: 24,
      isAvailable: true, isPopular: false, sortOrder: 2,
      categorySlug: "sets", image: IMG.classicSet, tags: [],
    },
    // ── Горячее ──
    {
      name: "Том Ям", slug: "tom-yam",
      description: "Острый тайский суп с морепродуктами и кокосовым молоком",
      ingredients: "Королевские креветки, кальмар, грибы шиитаке, лемонграсс, кокосовое молоко, специи",
      price: 520, weight: 400,
      isAvailable: true, isPopular: true, sortOrder: 1,
      categorySlug: "hot", image: IMG.tomYam, tags: ["Новинка", "Острое"],
    },
    {
      name: "Рамен с курицей", slug: "ramen-chicken",
      description: "Насыщенный японский бульон с яйцом и водорослями",
      ingredients: "Куриный бульон, рисовая лапша, яйцо, водоросли нори, зелёный лук, кунжут",
      price: 480, weight: 450,
      isAvailable: true, isPopular: false, sortOrder: 2,
      categorySlug: "hot", image: IMG.ramen, tags: [],
    },
    // ── Лапша / Вок ──
    {
      name: "Wok с курицей", slug: "wok-chicken",
      description: "Рисовая лапша с куриным филе и свежими овощами",
      ingredients: "Рисовая лапша, куриное филе, болгарский перец, морковь, лук, соус терияки",
      price: 410, weight: 350,
      isAvailable: true, isPopular: false, sortOrder: 1,
      categorySlug: "noodles", image: IMG.wokChicken, tags: [],
    },
    {
      name: "Wok с говядиной", slug: "wok-beef",
      description: "Лапша удон с нежной говядиной и соусом XO",
      ingredients: "Говяжья вырезка, лапша удон, болгарский перец, грибы, соус XO",
      price: 490, weight: 360,
      isAvailable: true, isPopular: false, sortOrder: 2,
      categorySlug: "noodles", image: IMG.wokBeef, tags: [],
    },
    // ── Закуски ──
    {
      name: "Гёдза", slug: "gyoza",
      description: "Жареные японские пельмени с хрустящей корочкой",
      ingredients: "Курица, капуста, лук, имбирь, кунжутное масло, соевый соус, тесто",
      price: 290, weight: 180, piecesCount: 6,
      isAvailable: true, isPopular: false, sortOrder: 1,
      categorySlug: "snacks", image: IMG.gyoza, tags: ["Новинка"],
    },
    {
      name: "Эдамаме", slug: "edamame",
      description: "Молодые соевые бобы с морской солью — лёгкая закуска",
      ingredients: "Соевые бобы, морская соль",
      price: 190, weight: 200,
      isAvailable: true, isPopular: false, sortOrder: 2,
      categorySlug: "snacks", image: IMG.edamame, tags: [],
    },
    // ── Напитки ──
    {
      name: "Зелёный чай Matcha", slug: "matcha-latte",
      description: "Японский матча с нежным молоком на выбор",
      ingredients: "Церемониальный матча, молоко (можно растительное), мёд",
      price: 220, weight: 300,
      isAvailable: true, isPopular: false, sortOrder: 1,
      categorySlug: "drinks", image: IMG.matcha, tags: [],
    },
    {
      name: "Лимонад Юзу", slug: "lemonade-yuzu",
      description: "Освежающий лимонад с японским цитрусом юзу",
      ingredients: "Японский цитрус юзу, газированная вода, мёд, мята",
      price: 180, weight: 400,
      isAvailable: true, isPopular: false, sortOrder: 2,
      categorySlug: "drinks", image: IMG.lemonade, tags: [],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      // Обновляем только цену и доступность
      await prisma.product.update({
        where: { slug: p.slug },
        data: {
          price:       p.price,
          isAvailable: p.isAvailable,
          isPopular:   p.isPopular,
          updatedAt:   new Date(),
        },
      });
      console.log(`  ~ ${p.name} (обновлён)`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name:          p.name,
        slug:          p.slug,
        description:   p.description,
        ingredients:   p.ingredients,
        price:         p.price,
        discountPrice: p.discountPrice,
        weight:        p.weight,
        piecesCount:   p.piecesCount,
        isAvailable:   p.isAvailable,
        isPopular:     p.isPopular,
        sortOrder:     p.sortOrder,
        categoryId:    catMap[p.categorySlug],
        images: {
          create: [{ url: p.image, isMain: true, sortOrder: 0, altText: p.name }],
        },
      },
    });

    // Привязываем теги
    for (const tagName of p.tags) {
      if (tagMap[tagName]) {
        await prisma.productTag.create({
          data: { productId: product.id, tagId: tagMap[tagName] },
        });
      }
    }
    console.log(`  + ${p.name}`);
  }

  // ── 6. Статусы заказов ────────────────────────────────────────────────────
  console.log("\nСоздаём статусы заказов...");
  const orderStatuses = [
    { name: "Новый",             slug: "new",        color: "#38bdf8", sortOrder: 1, isFinal: false, description: "Заказ только что создан" },
    { name: "Подтверждён",       slug: "confirmed",  color: "#f59e0b", sortOrder: 2, isFinal: false, description: "Оператор подтвердил заказ" },
    { name: "Готовится",         slug: "cooking",    color: "#f97316", sortOrder: 3, isFinal: false, description: "Повара готовят заказ" },
    { name: "Передан в доставку",slug: "delivering", color: "#a78bfa", sortOrder: 4, isFinal: false, description: "Курьер забрал заказ" },
    { name: "Доставлен",         slug: "delivered",  color: "#22c55e", sortOrder: 5, isFinal: true,  description: "Заказ успешно доставлен" },
    { name: "Отменён",           slug: "cancelled",  color: "#ef4444", sortOrder: 6, isFinal: true,  description: "Заказ отменён" },
  ];
  for (const s of orderStatuses) {
    await prisma.orderStatus.upsert({
      where:  { slug: s.slug },
      update: { name: s.name, color: s.color },
      create: s,
    });
  }
  console.log("  ✓ 6 статусов заказов");

  // ── 7. Приложение-настройки ───────────────────────────────────────────────
  console.log("Создаём настройки приложения...");
  const settings = [
    { key: "site_name",          value: "Суши Жейм" },
    { key: "site_phone",         value: "+996 505 255 444" },
    { key: "site_address",       value: "г. Бишкек, ул. Чуй 150" },
    { key: "delivery_min_order", value: "500" },
    { key: "free_delivery_from", value: "1200" },
    { key: "delivery_cost",      value: "199" },
  ];
  for (const s of settings) {
    await prisma.appSetting.upsert({
      where:  { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, updatedAt: new Date() },
    });
  }
  console.log("  ✓ 6 настроек");

  console.log("\n✅ База данных успешно заполнена!\n");
  console.log("Итого:");
  console.log(`  - Ролей:         2`);
  console.log(`  - Пользователей: 6`);
  console.log(`  - Категорий:     ${categories.length}`);
  console.log(`  - Тегов:         5`);
  console.log(`  - Товаров:       ${products.length}`);
  console.log(`  - Статусов:      6`);
  console.log(`  - Настроек:      6`);
}

main()
  .catch((e) => { console.error("❌ Ошибка сидирования:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
