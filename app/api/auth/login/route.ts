import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[LOGIN] Попытка входа:", { email: body.email });

    const { email, password } = body;

    // Валидация
    if (!email || !email.trim()) {
      return NextResponse.json({ 
        error: "Введите email" 
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ 
        error: "Введите пароль" 
      }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      include: { role: true }
    });

    if (!user) {
      console.log("[LOGIN] Пользователь не найден:", emailLower);
      return NextResponse.json({ 
        error: "Неверный email или пароль" 
      }, { status: 401 });
    }

    if (!user.password) {
      console.log("[LOGIN] У пользователя нет пароля:", emailLower);
      return NextResponse.json({ 
        error: "Неверный email или пароль" 
      }, { status: 401 });
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log("[LOGIN] Неверный пароль для:", emailLower);
      return NextResponse.json({ 
        error: "Неверный email или пароль" 
      }, { status: 401 });
    }

    // Проверяем активность
    if (!user.isActive) {
      console.log("[LOGIN] Аккаунт заблокирован:", emailLower);
      return NextResponse.json({ 
        error: "Аккаунт заблокирован" 
      }, { status: 403 });
    }

    // Обновляем время входа
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Создаём сессию
    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name
      }
    }, { status: 200 });

    await setSessionCookie({
      userId: user.id,
      name: user.name,
      email: user.email!,
      role: user.role.name
    }, res);

    console.log("[LOGIN] Успешный вход:", user.email);

    return res;

  } catch (error) {
    console.error("[LOGIN] Ошибка:", error);
    
    if (error instanceof Error) {
      console.error("[LOGIN] Сообщение:", error.message);
    }

    return NextResponse.json({ 
      error: "Ошибка сервера. Попробуйте позже.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
