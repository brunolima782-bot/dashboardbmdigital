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
  let payload: { role?: string; clientId?: string } | null = null;

  if (token) {
    try {
      const result = await jwtVerify(token, getSecretKey());
      payload = result.payload as { role?: string; clientId?: string };
    } catch {
      payload = null;
    }
  }

  if (!payload) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Clientes (portal do cliente) só podem ver o próprio relatório — nunca as
  // telas de gestão da agência nem os dados de outros clientes.
  if (payload.role === "CLIENT") {
    const clientHome = `/relatorios/${payload.clientId}`;
    const allowedApiPaths = ["/api/auth/logout", "/api/auth/password"];

    if (pathname.startsWith("/api")) {
      if (!allowedApiPaths.includes(pathname)) {
        return NextResponse.json({ error: "Acesso não permitido" }, { status: 403 });
      }
    } else if (pathname !== clientHome) {
      return NextResponse.redirect(new URL(clientHome, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon\\.|uploads).*)"],
};
