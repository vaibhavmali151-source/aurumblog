import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { rateLimit } from "@/lib/rate-limit";

// A separate NextAuth() call using ONLY the Edge-safe config (no Prisma, no bcrypt).
// This is the recommended split for NextAuth v5 + middleware.
const { auth } = NextAuth(authConfig);

function isTrustedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  return origin === req.nextUrl.origin;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for") ?? "local";

  // CSRF: block cross-origin state-changing requests to our API.
  if (pathname.startsWith("/api/") && req.method !== "GET" && !isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
  }

  // Rate limiting on sensitive endpoints.
  if (pathname.startsWith("/api/auth") || pathname === "/api/comments" || pathname === "/api/newsletter") {
    const { allowed } = rateLimit(`${ip}:${pathname}`, { limit: 10, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests, slow down." }, { status: 429 });
    }
  }

  // Admin area auth guard.
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Security headers on every response.
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
});

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
