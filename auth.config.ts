import type { NextAuthConfig } from "next-auth";

// Configuração "leve", sem Prisma nem bcrypt — segura para correr no
// Edge Runtime (middleware). A lógica de autenticação real (authorize)
// fica em lib/auth.ts, que só corre em rotas de servidor normais.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // os providers reais só são precisos em lib/auth.ts
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.empresaId = token.empresaId as string;
        session.user.empresaNome = token.empresaNome as string;
      }
      return session;
    },
  },
};