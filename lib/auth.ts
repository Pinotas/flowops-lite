import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

class EmailNaoExisteError extends CredentialsSignin {
  code = "email-nao-existe";
}

class ContaBloqueadaError extends CredentialsSignin {
  constructor(minutosRestantes: number) {
    super();
    this.code = `conta-bloqueada-${minutosRestantes}`;
  }
}

const LIMITE_TENTATIVAS = 5;
const DURACAO_BLOQUEIO_MS = 15 * 60 * 1000;

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
          throw new EmailNaoExisteError();
        }

        const agora = new Date();
        const bloqueioAtivo =
          utilizador.bloqueadoAte && utilizador.bloqueadoAte > agora;

        if (bloqueioAtivo) {
          const minutosRestantes = Math.ceil(
            (utilizador.bloqueadoAte!.getTime() - agora.getTime()) / 60000
          );
          throw new ContaBloqueadaError(minutosRestantes);
        }

        const passwordValida = await bcrypt.compare(
          credentials.password as string,
          utilizador.password
        );

        if (!passwordValida) {
          // Se o bloqueio anterior já tinha expirado, reinicia a contagem
          const tentativasAnteriores = utilizador.bloqueadoAte ? 0 : utilizador.tentativasFalhadas;
          const tentativas = tentativasAnteriores + 1;
          const atingiuLimite = tentativas >= LIMITE_TENTATIVAS;

          await prisma.utilizador.update({
            where: { id: utilizador.id },
            data: {
              tentativasFalhadas: atingiuLimite ? 0 : tentativas,
              bloqueadoAte: atingiuLimite
                ? new Date(agora.getTime() + DURACAO_BLOQUEIO_MS)
                : null,
            },
          });

          if (atingiuLimite) {
            throw new ContaBloqueadaError(DURACAO_BLOQUEIO_MS / 60000);
          }

          return null;
        }

        if (utilizador.tentativasFalhadas > 0 || utilizador.bloqueadoAte) {
          await prisma.utilizador.update({
            where: { id: utilizador.id },
            data: { tentativasFalhadas: 0, bloqueadoAte: null },
          });
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