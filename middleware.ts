import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const ROTAS_PUBLICAS = [
  "/login",
  "/registo",
  "/recuperar-password",
  "/redefinir-password",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const autenticado = !!req.auth;

  const rotaPublica = ROTAS_PUBLICAS.some((rota) =>
    pathname.startsWith(rota)
  );

  if (!autenticado && !rotaPublica && pathname !== "/") {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (autenticado && rotaPublica) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};