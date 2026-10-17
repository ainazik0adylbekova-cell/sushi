import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Категории без поля description — его нет в реальной схеме БД
const CATEGORIES = [
  { slug: "rolls",  name: "Роллы",   sortOrder: 1 },
  { slug: "sushi",  name: "Суши",    sortOrder: 2 },
  { slug: "sets",   name: "Сеты",    sortOrder: 3 },
  { slug: "hot",    name: "Вок",     sortOrder: 4 },
  { slug: "drinks", name: "Напитки", sortOrder: 5 },
];

export async function GET() {
  try {
    const results = [];
    for (const cat of CATEGORIES) {
      const created = await prisma.category.upsert({
        where:  { slug: cat.slug },
        update: { name: cat.name, sortOrder: cat.sortOrder, isActive: true },
        create: { ...cat, isActive: true },
      });
      results.push(created);
    }
    return NextResponse.json({ ok: true, count: results.length, categories: results });
  } catch (err) {
    console.error("[seed-categories]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
