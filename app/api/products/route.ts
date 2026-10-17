import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const categorySlug = searchParams.get("category");
    const search       = searchParams.get("q");

    const products = await prisma.product.findMany({
      where: {
        ...(categorySlug && categorySlug !== "all"
          ? { category: { slug: categorySlug } }
          : {}),
        ...(search ? {
          OR: [
            { name:        { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, categoryId, price,
      description, weight,
      isAvailable = true,
      imageUrl,
    } = body;

    if (!name?.trim())        return NextResponse.json({ error: "Введите название" },  { status: 400 });
    if (!categoryId)          return NextResponse.json({ error: "Выберите категорию" }, { status: 400 });
    if (!price || Number(price) <= 0) return NextResponse.json({ error: "Укажите цену" }, { status: 400 });

    // categoryId может прийти как uuid или slug
    const resolvedCategoryId = await resolveCategoryId(categoryId);
    if (!resolvedCategoryId) {
      return NextResponse.json({ error: "Категория не найдена" }, { status: 400 });
    }

    // Генерируем slug из названия
    const slug = generateSlug(name);

    // Проверяем уникальность slug
    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existingProduct ? `${slug}-${Date.now()}` : slug;

    const product = await prisma.product.create({
      data: {
        name:        name.trim(),
        slug:        finalSlug,
        description: description?.trim() || null,
        price:       parseFloat(String(price)),
        weight:      weight?.trim() || null,
        imageUrl:    imageUrl || null,
        isAvailable: Boolean(isAvailable),
        categoryId:  resolvedCategoryId,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products] Error:", err);
    // Выводим полное сообщение об ошибке
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/products] Error message:", errorMessage);
    return NextResponse.json({ 
      error: "Ошибка при создании товара", 
      details: errorMessage 
    }, { status: 500 });
  }
}

// Генерируем slug из названия
function generateSlug(name: string): string {
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  };

  return name
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

// Резолвим categoryId: принимаем uuid или slug
async function resolveCategoryId(raw: unknown): Promise<string | null> {
  const s = String(raw).trim();
  
  if (!s) return null;

  // Если это uuid (содержит дефисы)
  if (s.includes('-') && s.length >= 32) {
    const cat = await prisma.category.findUnique({ where: { id: s } });
    return cat?.id ?? null;
  }

  // "cat-rolls" → slug = "rolls"
  const slug = s.startsWith("cat-") ? s.replace("cat-", "") : s;

  const cat = await prisma.category.findUnique({ where: { slug } });
  return cat?.id ?? null;
}
