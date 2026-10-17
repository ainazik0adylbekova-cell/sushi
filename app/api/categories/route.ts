import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Статические категории — возвращаются если БД недоступна или пустая
const STATIC_CATEGORIES = [
  { id: 1, slug: "rolls",   name: "Роллы",    sortOrder: 1, productCount: 0 },
  { id: 2, slug: "sushi",   name: "Суши",     sortOrder: 2, productCount: 0 },
  { id: 3, slug: "sets",    name: "Сеты",     sortOrder: 3, productCount: 0 },
  { id: 4, slug: "hot",     name: "Вок",      sortOrder: 4, productCount: 0 },
  { id: 5, slug: "drinks",  name: "Напитки",  sortOrder: 5, productCount: 0 },
];

export async function GET() {
  try {
    const cats = await prisma.category.findMany({
      where:   { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });

    if (cats.length === 0) {
      // Таблица пустая — сидируем и возвращаем статику
      await seedCategories();
      const seeded = await prisma.category.findMany({
        where:   { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      });
      return NextResponse.json({
        categories: seeded.map(c => ({ ...c, productCount: c._count.products })),
      });
    }

    return NextResponse.json({
      categories: cats.map(c => ({ ...c, productCount: c._count.products })),
    });
  } catch (err) {
    console.error("[GET /api/categories]", err);
    // Возвращаем статические категории если БД недоступна
    return NextResponse.json({ categories: STATIC_CATEGORIES });
  }
}

async function seedCategories() {
  const cats = [
    { slug: "rolls",  name: "Роллы",   sortOrder: 1 },
    { slug: "sushi",  name: "Суши",    sortOrder: 2 },
    { slug: "sets",   name: "Сеты",    sortOrder: 3 },
    { slug: "hot",    name: "Вок",     sortOrder: 4 },
    { slug: "drinks", name: "Напитки", sortOrder: 5 },
  ];
  for (const c of cats) {
    await prisma.category.upsert({
      where:  { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder, isActive: true },
      create: { ...c, isActive: true },
    }).catch(() => {}); // ignore unique constraint errors
  }
}
