import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/auth";

export async function GET() {
  try {
    const url = buildGoogleAuthUrl();
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("[/api/auth/google]", err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/login?error=google_config`);
  }
}
