import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    databaseConfigured: !!process.env.DATABASE_URL,
    finikConfigured: !!(process.env.FINIK_API_KEY && process.env.FINIK_ACCOUNT_ID),
    jwtConfigured: !!process.env.JWT_SECRET,
    googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('your_google')),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      FINIK_ENV: process.env.FINIK_ENV || 'NOT SET',
      FINIK_API_KEY: process.env.FINIK_API_KEY ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    }
  });
}
