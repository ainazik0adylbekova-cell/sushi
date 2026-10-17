/**
 * GET /api/admin/session
 * Проверяет наличие действующей сессионной cookie admin_session.
 */

import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (session?.value === "1") {
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false }, { status: 401 });
}
