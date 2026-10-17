/**
 * /register → redirect to the unified /login?tab=register page.
 * This keeps old links working.
 */
import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/login?tab=register");
}
