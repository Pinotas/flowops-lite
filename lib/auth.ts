import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const utilizador = await prisma.utilizador.findUnique({
          where: { email: credentials.email as string },
          include: { empresa: true },
        });

        if (!utilizador) {
          return null;
        }

        const passwordValida = await bcrypt.compare(
          credentials.password as string,
          utilizador.password
        );

        if (!passwordValida) {
          return null;
        }

        return {
          id: utilizador.id,
          name: utilizador.nome,
          email: utilizador.email,
          empresaId: utilizador.empresaId,
          empresaNome: utilizador.empresa.nome,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.empresaId = user.empresaId;
        token.empresaNome = user.empresaNome;
      }
      return token;
    },
  },
});