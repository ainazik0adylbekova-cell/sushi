import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/admin/clear-products — удаляет все тестовые товары
export async function POST() {
  try {
    // Сначала обнуляем ссылки в orderItems (чтобы не нарушить историю заказов)
    await prisma.orderItem.updateMany({
      where: { productId: { not: null } },
      data:  { productId: null },
    });
    // Удаляем все товары
    const { count } = await prisma.product.deleteMany({});
    return NextResponse.json({ ok: true, deleted: count });
  } catch (err) {
    console.error("[clear-products]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
