import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// "/" é agora a página de login. Estas são as restantes rotas públicas.
const ROTAS_PUBLICAS = [
  "/login",
  "/registo",
  "/recuperar-password",
  "/redefinir-password",
];

// Rotas públicas que NUNCA redirecionam, mesmo com sessão ativa — usadas
// por clientes externos (sem conta) para responder a um orçamento.
const ROTAS_PUBLICAS_SEMPRE = ["/proposta"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const autenticado = !!req.auth;

  if (ROTAS_PUBLICAS_SEMPRE.some((rota) => pathname.startsWith(rota))) {
    return NextResponse.next();
  }

  const rotaPublica =
    pathname === "/" ||
    ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  // Autenticado a tentar aceder a uma página pública (login/registo/landing)
  // → já não precisa, vai direto para o dashboard
  if (autenticado && rotaPublica) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Não autenticado a tentar aceder a rota protegida → manda para a login (/)
  if (!autenticado && !rotaPublica) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};