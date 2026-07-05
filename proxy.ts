import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookieName, readSessionToken } from "@/lib/session-token";

const publicPaths = new Set(["/", "/login", "/signup", "/pricing"]);

function isPublicPath(pathname: string) {
  if (publicPaths.has(pathname)) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/api/payments/crypto/")) return true;
  return false;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname.includes(".")) {
    return NextResponse.next();
  }
  const token = req.cookies.get(getSessionCookieName())?.value;
  const session = token ? await readSessionToken(token) : null;

  if ((pathname === "/login" || pathname === "/signup") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!robots.txt|sitemap.xml).*)"],
};
