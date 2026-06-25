"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clientes", label: "Clientes" },
  { href: "/orcamentos", label: "Orçamentos" },
  { href: "/trabalhos", label: "Trabalhos" },
  { href: "/perfil", label: "Perfil" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const autenticado = status === "authenticated" && !!session?.user;

  const iniciais = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <nav className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-accent)] text-[11px] font-bold text-white">
              F
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
              FlowOps
            </span>
          </Link>

          {autenticado && (
            <div className="hidden items-center gap-1 md:flex">
              {LINKS.map((link) => {
                const ativo = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      ativo
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                        : "text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {autenticado && (
            <button
              onClick={() => setMenuMobileAberto((v) => !v)}
              aria-label="Abrir menu"
              className="rounded-md p-2 text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)] md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {autenticado ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuAberto((v) => !v)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-[var(--color-bg)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-ink)] text-[11px] font-medium text-white">
                  {iniciais}
                </span>
                <span className="hidden font-medium text-[var(--color-ink)] sm:inline">
                  {session.user.name}
                </span>
              </button>

              {menuAberto && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg shadow-black/5">
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-[var(--color-ink-faint)]">
                      {session.user.email}
                    </p>
                    <p className="mt-1.5 inline-block rounded-md bg-[var(--color-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink-muted)]">
                      {session.user.empresaNome}
                    </p>
                  </div>
                  <div className="my-1 border-t border-[var(--color-border)]" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-soft)]"
                  >
                    Terminar sessão
                  </button>
                </div>
              )}
            </div>
          ) : (
            status !== "loading" && (
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
            )
          )}
        </div>
      </div>

      {autenticado && menuMobileAberto && (
        <div className="border-t border-[var(--color-border)] px-4 py-2 md:hidden">
          {LINKS.map((link) => {
            const ativo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuMobileAberto(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
