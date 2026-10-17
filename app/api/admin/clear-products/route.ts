import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/admin/clear-products — удаляет все тестовые товары
export async function POST() {
  try {
    await prisma.cartItem.deleteMany({});
    await prisma.orderItem.deleteMany({});
    // Удаляем все товары
    const { count } = await prisma.product.deleteMany({});
    return NextResponse.json({ ok: true, deleted: count });
  } catch (err) {
    console.error("[clear-products]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
