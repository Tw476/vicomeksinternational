import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, verifyAdminSessionToken } from "./lib/admin-session";

const oldAdminPath = "/admin";
const adminPath = "/secure-vicomeks-admin";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isOldAdminRoute = pathname === oldAdminPath || pathname.startsWith(`${oldAdminPath}/`);

  if (isOldAdminRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `${adminPath}${pathname.slice(oldAdminPath.length)}`;
    return NextResponse.redirect(redirectUrl);
  }

  const isAdminRoute = pathname === adminPath || pathname.startsWith(`${adminPath}/`);
  const isLogin = pathname === `${adminPath}/login`;
  const isUnauthorized = pathname === `${adminPath}/unauthorized`;
  if (!isAdminRoute || isLogin || isUnauthorized) return NextResponse.next();

  const sessionCookie = request.cookies.get(adminCookieName)?.value;
  if (!(await verifyAdminSessionToken(sessionCookie))) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL(`${adminPath}/unauthorized`, request.url));
    }
    const loginUrl = new URL(`${adminPath}/login`, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/secure-vicomeks-admin/:path*"]
};
