import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where:   { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!product) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    console.error("[GET /api/products/[id]]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name, categoryId, price,
      description, weight, isAvailable, imageUrl,
    } = body;

    const data: Record<string, unknown> = {};
    if (name        !== undefined) data.name        = name.trim();
    if (description !== undefined) data.description = description?.trim() || null;
    if (price       !== undefined) data.price       = parseFloat(String(price));
    if (weight      !== undefined) data.weight      = weight?.toString().trim() || null;
    if (imageUrl    !== undefined) data.imageUrl    = imageUrl || null;
    if (isAvailable !== undefined) data.isAvailable = Boolean(isAvailable);

    if (categoryId !== undefined) {
      const catId = await resolveCategoryId(categoryId);
      if (catId) data.categoryId = catId;
    }

    const product = await prisma.product.update({
      where:   { id },
      data,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ product });
  } catch (err) {
    console.error("[PUT /api/products/[id]]", err);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;

    // Безопасно удаляем зависимости
    await prisma.cartItem.deleteMany({
      where: { productId: id },
    });
    await prisma.orderItem.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/products/[id]]", err);
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}

async function resolveCategoryId(raw: unknown): Promise<string | null> {
  const s = String(raw).trim();
  
  if (!s) return null;

  // Если это uuid (содержит дефисы)
  if (s.includes('-') && s.length >= 32) {
    const cat = await prisma.category.findUnique({ where: { id: s } });
    return cat?.id ?? null;
  }

  // Если это slug
  const slug = s.startsWith("cat-") ? s.replace("cat-", "") : s;
  const cat = await prisma.category.findUnique({ where: { slug } });
  return cat?.id ?? null;
}
