import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/reviews?productId=xxx   — list visible reviews for a product
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId)
    return NextResponse.json({ error: "productId обязателен" }, { status: 400 });

  try {
    const reviews = await prisma.review.findMany({
      where:   { productId, isVisible: true },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true } } },
    });

    const avg =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null;

    return NextResponse.json({ reviews, avgRating: avg, count: reviews.length });
  } catch (err) {
    console.error("[GET /api/reviews]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// POST /api/reviews  — add a review (must be authenticated)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Необходимо войти в аккаунт" }, { status: 401 });

    const { productId, rating, comment } = await req.json();

    if (!productId)
      return NextResponse.json({ error: "productId обязателен" }, { status: 400 });
    if (!rating || rating < 1 || rating > 5)
      return NextResponse.json({ error: "Оценка должна быть от 1 до 5" }, { status: 400 });

    // Find the matching user by session userId
    // Session userId is a number (Int from actual DB schema)
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user)
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product)
      return NextResponse.json({ error: "Блюдо не найдено" }, { status: 404 });

    // Upsert — one review per user per product
    // The schema has @@unique([userId, productId])
    const review = await prisma.review.upsert({
      where:  { userId_productId: { userId: user.id, productId } },
      update: { rating, comment: comment?.trim() || null, isVisible: true, updatedAt: new Date() },
      create: { userId: user.id, productId, rating, comment: comment?.trim() || null, isVisible: true },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
