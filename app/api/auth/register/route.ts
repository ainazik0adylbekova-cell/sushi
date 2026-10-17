import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[REGISTER] Получены данные:", { ...body, password: "***" });

    const { name, email, phone, password } = body;

    // Валидация
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Введите имя" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Введите email" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ 
        error: "Пароль должен содержать минимум 6 символов" 
      }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // Проверяем существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (existingUser) {
      console.log("[REGISTER] Email уже существует:", emailLower);
      return NextResponse.json({ 
        error: "Этот email уже зарегистрирован" 
      }, { status: 409 });
    }

    // Ищем роль "Пользователь"
    let userRole = await prisma.role.findFirst({
      where: {
        OR: [
          { name: "Пользователь" },
          { name: "USER" },
          { name: "User" },
          { name: "пользователь" }
        ]
      }
    });

    // Если роли нет - пробуем создать
    if (!userRole) {
      console.log("[REGISTER] Роль 'Пользователь' не найдена, пытаюсь создать...");
      try {
        userRole = await prisma.role.create({
          data: {
            name: "Пользователь",
            description: "Обычный пользователь"
          }
        });
        console.log("[REGISTER] Роль создана:", userRole.id);
      } catch (roleError) {
        console.error("[REGISTER] Ошибка создания роли:", roleError);
        // Попробуем взять любую существующую роль
        const allRoles = await prisma.role.findMany();
        console.log("[REGISTER] Доступные роли:", allRoles);
        
        if (allRoles.length > 0) {
          userRole = allRoles[0];
          console.log("[REGISTER] Используем первую доступную роль:", userRole.name);
        } else {
          return NextResponse.json({ 
            error: "Роль пользователя не найдена. Обратитесь к администратору." 
          }, { status: 500 });
        }
      }
    }

    console.log("[REGISTER] Используемая роль:", userRole.id, userRole.name);

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("[REGISTER] Пароль захеширован");

    // Создаём пользователя
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailLower,
        phone: phone?.trim() || null,
        password: passwordHash,
        roleId: userRole.id,
        isActive: true,
        isVerified: false
      },
      include: {
        role: true
      }
    });

    console.log("[REGISTER] Пользователь создан:", newUser.id, newUser.email);

    // Создаём сессию
    await setSessionCookie({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email!,
      role: newUser.role.name
    });

    console.log("[REGISTER] Сессия установлена");

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role.name
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[REGISTER] Ошибка:", error);
    
    if (error instanceof Error) {
      console.error("[REGISTER] Сообщение:", error.message);
      console.error("[REGISTER] Stack:", error.stack);
    }

    return NextResponse.json({ 
      error: "Ошибка при регистрации. Попробуйте позже.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
