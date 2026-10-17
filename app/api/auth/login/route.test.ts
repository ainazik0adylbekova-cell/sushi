import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

const TEST_EMAIL = "test-login-user@example.com";
const TEST_PASSWORD = "ValidPassword123!";

beforeAll(async () => {
  // Ensure role exists
  let role = await prisma.role.findFirst({
    where: { name: "Пользователь" }
  });
  if (!role) {
    role = await prisma.role.create({
      data: {
        name: "Пользователь",
        description: "Обычный пользователь"
      }
    });
  }

  // Create or reset test user
  await prisma.user.deleteMany({
    where: { email: TEST_EMAIL }
  });

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  await prisma.user.create({
    data: {
      name: "Login Tester",
      email: TEST_EMAIL,
      password: passwordHash,
      roleId: role.id,
      isActive: true,
      isVerified: true
    }
  });
});

afterEach(async () => {
  // Keep base test user, delete any extras
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "@test-login-extra-"
      }
    }
  });
});

describe("POST /api/auth/login", () => {
  it("should succeed with valid email and password", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      }),
      headers: { "Content-Type": "application/json" }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(TEST_EMAIL);
    expect(data.user.name).toBe("Login Tester");
    expect(data.user.role).toBe("Пользователь");
  });

  it("should succeed with mixed case and trimmed email", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "  TEST-LOGIN-USER@EXAMPLE.COM  ",
        password: TEST_PASSWORD
      }),
      headers: { "Content-Type": "application/json" }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(TEST_EMAIL);
  });

  it("should return 401 with incorrect password", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: "WrongPassword999!"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Неверный email или пароль");
  });

  it("should return 401 with non-existent email", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "doesnotexist@example.com",
        password: TEST_PASSWORD
      }),
      headers: { "Content-Type": "application/json" }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Неверный email или пароль");
  });

  it("should return 400 when email or password is missing", async () => {
    const reqEmptyEmail = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "",
        password: TEST_PASSWORD
      }),
      headers: { "Content-Type": "application/json" }
    });

    const res1 = await POST(reqEmptyEmail);
    expect(res1.status).toBe(400);

    const reqEmptyPass = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: ""
      }),
      headers: { "Content-Type": "application/json" }
    });

    const res2 = await POST(reqEmptyPass);
    expect(res2.status).toBe(400);
  });

  it("should return 403 when account is blocked/inactive", async () => {
    const blockedEmail = `blocked-${Date.now()}@test-login-extra-blocked.com`;
    const role = await prisma.role.findFirst({ where: { name: "Пользователь" } });
    
    await prisma.user.create({
      data: {
        name: "Blocked User",
        email: blockedEmail,
        password: await bcrypt.hash("pass123", 10),
        roleId: role!.id,
        isActive: false
      }
    });

    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: blockedEmail,
        password: "pass123"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Аккаунт заблокирован");
  });
});
