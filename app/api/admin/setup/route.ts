/**
 * GET /api/admin/setup
 * Создаёт категории в БД и удаляет все тестовые блюда.
 * Вызывается один раз для первоначальной настройки.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CATS = [
  { slug: "rolls",  name: "Роллы",   sortOrder: 1 },
  { slug: "sushi",  name: "Суши",    sortOrder: 2 },
  { slug: "sets",   name: "Сеты",    sortOrder: 3 },
  { slug: "hot",    name: "Вок",     sortOrder: 4 },
  { slug: "drinks", name: "Напитки", sortOrder: 5 },
];

export async function GET() {
  const result: Record<string, unknown> = {};

  // 1. Создаём категории
  try {
    const cats = [];
    for (const c of CATS) {
      const cat = await prisma.category.upsert({
        where:  { slug: c.slug },
        update: { name: c.name, sortOrder: c.sortOrder, isActive: true },
        create: { ...c, isActive: true },
      });
      cats.push(cat);
    }
    result.categories = { ok: true, count: cats.length };
  } catch (e) {
    result.categories = { ok: false, error: String(e) };
  }

  // 2. Очищаем тестовые блюда
  try {
    await prisma.cartItem.deleteMany({}).catch(() => {});
    await prisma.orderItem.deleteMany({}).catch(() => {});

    const { count } = await prisma.product.deleteMany({});
    result.products = { ok: true, deleted: count };
  } catch (e) {
    result.products = { ok: false, error: String(e) };
  }

  return NextResponse.json({ ok: true, ...result });
}
