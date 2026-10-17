import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, fetchGoogleUser, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { searchParams } = req.nextUrl;

  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`);
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const gUser  = await fetchGoogleUser(tokens.access_token);

    if (!gUser.email) {
      return NextResponse.redirect(`${appUrl}/login?error=google_no_email`);
    }

    // Получаем или создаем роль "Пользователь"
    let userRole = await prisma.role.findFirst({
      where: { 
        OR: [
          { name: "Пользователь" },
          { name: "USER" },
          { name: "User" }
        ]
      }
    });

    if (!userRole) {
      userRole = await prisma.role.create({
        data: {
          name: "Пользователь",
          description: "Обычный пользователь"
        }
      });
    }

    // Upsert user
    let user = await prisma.user.findUnique({ 
      where: { email: gUser.email },
      include: { role: true }
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data:  { name: gUser.name },
        include: { role: true }
      });
    } else {
      user = await prisma.user.create({
        data: {
          name:     gUser.name,
          email:    gUser.email,
          password: "", // Google users have no local password
          roleId:   userRole.id,
        },
        include: { role: true }
      });
    }

    await setSessionCookie({
      userId: user.id,
      name:   user.name,
      email:  user.email!,
      avatar: gUser.picture,
      role:   user.role.name,
    });

    return NextResponse.redirect(`${appUrl}/`);
  } catch (err) {
    console.error("[/api/auth/google/callback]", err);
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`);
  }
}
