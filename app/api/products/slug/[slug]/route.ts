import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/products/slug/[slug]  — public; fetch one product by its URL slug
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images:   { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }] },
        tags:     { include: { tag: { select: { id: true, name: true, color: true } } } },
        reviews: {
          where:   { isVisible: true },
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Блюдо не найдено" }, { status: 404 });
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
        : null;

    return NextResponse.json({
      product: {
        ...product,
        price:         parseFloat(String(product.price)),
        discountPrice: product.discountPrice ? parseFloat(String(product.discountPrice)) : null,
        weight:        product.weight        ? parseFloat(String(product.weight))        : null,
        tags:          product.tags.map((pt) => pt.tag),
        mainImage:     product.images.find((i) => i.isMain)?.url ?? product.images[0]?.url ?? null,
        avgRating,
        reviewCount: product.reviews.length,
      },
    });
  } catch (err) {
    console.error("[GET /api/products/slug/[slug]]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
