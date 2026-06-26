"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuAberto, setMenuAberto] = useState(false);

  const autenticado = status === "authenticated" && !!session?.user;
  const usarSidebar = autenticado && !pathname.startsWith("/proposta");

  // O cookie de sessão do Auth.js é sempre persistente (30 dias) — não há
  // forma fiável de o tornar "de sessão" via Set-Cookie porque o próprio
  // middleware de autenticação reemite o cookie persistente em quase todos
  // os pedidos. Em vez disso, simulamos "terminar sessão ao fechar o
  // browser" com sessionStorage: ao reabrir o browser (sessionStorage
  // vazio) com "Manter sessão iniciada" desmarcado no login anterior,
  // termina-se a sessão automaticamente.
  useEffect(() => {
    if (!autenticado) return;
    const sessaoAtivaNesteBrowser = sessionStorage.getItem("flowops-sessao-ativa");
    if (!sessaoAtivaNesteBrowser && document.cookie.includes("flowops-lembrar=0")) {
      signOut({ callbackUrl: "/login" });
      return;
    }
    sessionStorage.setItem("flowops-sessao-ativa", "1");
  }, [autenticado]);

  if (!usarSidebar) {
    return (
      <>
        <nav className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="FlowOps" className="h-6 w-6" />
              <span className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
                FlowOps
              </span>
            </Link>
            {status !== "loading" && !autenticado && (
              <div className="flex items-center gap-2">
                {pathname !== "/" && pathname !== "/login" && (
                  <Link
                    href="/"
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
                  >
                    Entrar
                  </Link>
                )}
                {pathname !== "/registo" && (
                  <Link
                    href="/registo"
                    className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                  >
                    Criar conta
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
        {children}
      </>
    );
  }

  return (
    <>
      <Sidebar open={menuAberto} onClose={() => setMenuAberto(false)} />

      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur-sm md:hidden">
        <button
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)]"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/dashboard" className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
          FlowOps
        </Link>
      </div>

      <div className="md:pl-64">{children}</div>
    </>
  );
}
