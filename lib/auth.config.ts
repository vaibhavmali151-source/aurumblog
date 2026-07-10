import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible slice of the NextAuth config. Middleware runs on the Edge
 * runtime, which can't load Prisma's native query engine or bcrypt, so this
 * file must never import "@/lib/prisma" or "bcryptjs". It only needs enough
 * config to verify/read the session JWT. The Credentials provider itself
 * (with real DB lookups) lives in lib/auth.ts, which only runs in the
 * Node.js runtime (the /api/auth route handler and server components).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // populated in lib/auth.ts for the Node runtime
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
