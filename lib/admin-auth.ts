import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, verifyAdminSessionToken } from "./admin-session";

export { adminCookieName };

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(adminCookieName)?.value);
}

export function requireAdminResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
