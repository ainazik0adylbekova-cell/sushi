import { NextResponse } from "next/server";

/** Quick check whether Google OAuth is configured (credentials are real values). */
export async function GET() {
  const id     = process.env.GOOGLE_CLIENT_ID     ?? "";
  const secret = process.env.GOOGLE_CLIENT_SECRET ?? "";

  const configured =
    id.length > 10 &&
    secret.length > 10 &&
    !id.includes("your_google") &&
    !secret.includes("your_google");

  return NextResponse.json({ configured });
}
