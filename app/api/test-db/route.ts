import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    console.log("[TEST] Testing database connection...");
    
    // Проверяем подключение
    await prisma.$connect();
    console.log("[TEST] Connected to database");
    
    // Проверяем существующие роли
    const roles = await prisma.role.findMany();
    console.log("[TEST] Found roles:", roles);
    
    // Если ролей нет - создаем
    if (roles.length === 0) {
      console.log("[TEST] No roles found, creating default role...");
      const newRole = await prisma.role.create({
        data: {
          name: "Пользователь",
          description: "Обычный пользователь"
        }
      });
      console.log("[TEST] Created role:", newRole);
      
      return NextResponse.json({
        success: true,
        message: "Role created",
        role: newRole,
        allRoles: [newRole]
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "Database connected",
      roles: roles
    });
    
  } catch (error: any) {
    console.error("[TEST] Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
