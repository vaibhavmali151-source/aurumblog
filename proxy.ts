import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// Next.js 16 renamed the `middleware` convention to `proxy` (runs on the
// nodejs runtime, not edge). See node_modules/next/dist/docs .../version-16.md.

// NextAuth v5 sets a secure, httpOnly, SameSite=lax session cookie by default,
// which combined with the Origin check below gives CSRF protection for state
// changing requests without needing a separate token for same-origin form posts.
function isTrustedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin navigations / server-to-server
  return origin === req.nextUrl.origin;
}

const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for") ?? "local";

  // --- CSRF: block cross-origin state-changing requests to our API ---
  if (pathname.startsWith("/api/") && req.method !== "GET" && !isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
  }

  // --- Rate limiting on sensitive endpoints ---
  if (pathname.startsWith("/api/auth") || pathname === "/api/comments" || pathname === "/api/newsletter") {
    const { allowed } = rateLimit(`${ip}:${pathname}`, { limit: 10, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests, slow down." }, { status: 429 });
    }
  }

  // --- Admin area auth guard ---
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Security headers on every response
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
});

export { proxy };
export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
