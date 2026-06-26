"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { useLocale } from "./LocaleProvider";
import { IDIOMAS } from "@/lib/i18n/dicionarios";

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { tema, alternarTema } = useTheme();
  const { idioma, definirIdioma, t } = useLocale();
  const [menuIdiomaAberto, setMenuIdiomaAberto] = useState(false);
  const menuIdiomaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (menuIdiomaRef.current && !menuIdiomaRef.current.contains(e.target as Node)) {
        setMenuIdiomaAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const LINKS = [
    {
      href: "/dashboard",
      label: t.nav.dashboard,
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="2.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11.5" y="2.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2.5" y="11.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11.5" y="11.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      href: "/clientes",
      label: t.nav.clientes,
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.5 17c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/orcamentos",
      label: t.nav.orcamentos,
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M5 2.5h7l3.5 3.5V17a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 8h6M7 11h6M7 14h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/trabalhos",
      label: t.nav.trabalhos,
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M7 5.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 4v1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2.5" y="5.5" width="15" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.5 10.5h15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      href: "/perfil",
      label: t.nav.perfil,
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 10.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 15.3c.9-1.8 2.7-2.8 5-2.8s4.1 1 5 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const iniciais = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#16161a] transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2 px-5 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="FlowOps" className="h-7 w-7" />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            FlowOps
          </span>
        </Link>

        {session?.user?.empresaNome && (
          <div className="mx-3 mb-3 rounded-lg bg-white/5 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              {t.nav.empresa}
            </p>
            <p className="truncate text-sm font-medium text-zinc-200">
              {session.user.empresaNome}
            </p>
          </div>
        )}

        <p className="mb-1 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {t.nav.secao}
        </p>
        <nav className="flex-1 space-y-0.5 px-3">
          {LINKS.map((link) => {
            const ativo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-white text-[#16161a]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/perfil"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-accent)] text-[11px] font-medium text-white">
              {session?.user?.empresaLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.empresaLogoUrl}
                  alt={session?.user?.name || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                iniciais
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {session?.user?.name}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {session?.user?.email}
              </p>
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 17.5h-3a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 4.5 2.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 14l4-4-4-4M17 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.nav.logout}
          </button>

          <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
            <div className="relative" ref={menuIdiomaRef}>
              <button
                onClick={() => setMenuIdiomaAberto((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
              >
                <span>{t.nav.idioma}</span>
                <span className="flex items-center gap-1 text-zinc-300">
                  {t.nav.nomesIdiomas[idioma]}
                  <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
                    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {menuIdiomaAberto && (
                <div className="absolute bottom-full left-0 mb-1 w-full overflow-hidden rounded-lg border border-white/10 bg-[#1f1f23] shadow-lg">
                  {IDIOMAS.map((codigo) => (
                    <button
                      key={codigo}
                      onClick={() => {
                        definirIdioma(codigo);
                        setMenuIdiomaAberto(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
                        idioma === codigo
                          ? "bg-white/10 text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {t.nav.nomesIdiomas[codigo]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium text-zinc-500">{t.nav.tema}</span>
              <button
                onClick={alternarTema}
                role="switch"
                aria-checked={tema === "dark"}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  tema === "dark" ? "bg-[var(--color-accent)]" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] transition-transform ${
                    tema === "dark" ? "translate-x-4" : "translate-x-0"
                  }`}
                >
                  {tema === "dark" ? "🌙" : "☀"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
