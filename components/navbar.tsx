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
];

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuAberto, setMenuAberto] = useState(false);
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

  // Não mostra a navbar nas páginas de login/registo
  if (pathname === "/login" || pathname === "/registo") {
    return null;
  }

  const iniciais = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-1">
          <span className="mr-6 text-sm font-semibold text-slate-900">
            FlowOps
          </span>
          {LINKS.map((link) => {
            const ativo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  ativo
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {status === "authenticated" && session?.user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuAberto((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
                {iniciais}
              </span>
              <span className="hidden font-medium text-slate-700 sm:inline">
                {session.user.name}
              </span>
            </button>

            {menuAberto && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {session.user.email}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {session.user.empresaNome}
                  </p>
                </div>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Terminar sessão
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}