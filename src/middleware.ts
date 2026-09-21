import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "trafego_session";
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

function getSecretKey() {
  const secret = process.env.AUTH_SECRET || "dev-secret-nao-usar-em-producao";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/icon.")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let isValid = false;

  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  if (!isValid) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon\\.|uploads).*)"],
};
