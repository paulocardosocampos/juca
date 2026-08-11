import type { NextAuthConfig } from "next-auth";

// Configuração edge-safe (sem Prisma) — usada também pelo middleware.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminArea = pathname.startsWith("/admin");
      const isLoginPage = pathname.startsWith("/admin/login");
      if (!isAdminArea || isLoginPage) return true;
      return !!auth?.user;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
