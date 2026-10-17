import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ user: null });

    const user = await prisma.user.findUnique({ 
      where: { id: session.userId },
      include: { role: true }
    });
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id:     user.id,
        name:   user.name,
        email:  user.email,
        avatar: session.avatar, // Google avatar from JWT
        role:   user.role.name,
      },
    });
  } catch (err) {
    console.error("[/api/auth/me]", err);
    return NextResponse.json({ user: null });
  }
}
