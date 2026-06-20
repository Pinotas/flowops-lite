"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
};

type Orcamento = {
  id: string;
  descricao: string;
  preco: number;
  cliente: Cliente;
};

type Trabalho = {
  id: string;
  data: string;
  notas: string | null;
  cliente: Cliente;
};

type DashboardData = {
  totais: {
    clientes: number;
    orcamentosPendentes: number;
    trabalhosHoje: number;
  };
  clientesNovos: Cliente[];
  orcamentosPendentes: Orcamento[];
  trabalhosHoje: Trabalho[];
};

function formatarPreco(preco: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(preco);
}

function formatarHora(dataISO: string) {
  return new Date(dataISO).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Erro ao carregar dashboard");
        const data = await res.json();
        setDados(data);
      } catch {
        setErro("Não foi possível carregar o dashboard.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const hoje = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm capitalize text-slate-500">{hoje}</p>
        </header>

        {loading ? (
          <p className="text-sm text-slate-500">A carregar...</p>
        ) : erro ? (
          <p className="text-sm font-medium text-red-600">{erro}</p>
        ) : dados ? (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Clientes
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {dados.totais.clientes}
                </p>
                <Link
                  href="/clientes"
                  className="mt-2 inline-block text-xs font-medium text-slate-500 underline"
                >
                  Ver todos
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Orçamentos pendentes
                </p>
                <p className="mt-2 text-3xl font-semibold text-amber-600">
                  {dados.totais.orcamentosPendentes}
                </p>
                <Link
                  href="/orcamentos"
                  className="mt-2 inline-block text-xs font-medium text-slate-500 underline"
                >
                  Ver todos
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Trabalhos hoje
                </p>
                <p className="mt-2 text-3xl font-semibold text-blue-600">
                  {dados.totais.trabalhosHoje}
                </p>
                <Link
                  href="/trabalhos"
                  className="mt-2 inline-block text-xs font-medium text-slate-500 underline"
                >
                  Ver todos
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Clientes novos
                  </h2>
                </div>
                {dados.clientesNovos.length === 0 ? (
                  <p className="p-5 text-sm text-slate-400">
                    Sem clientes novos.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {dados.clientesNovos.map((c) => (
                      <li key={c.id} className="px-5 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {c.nome}
                        </p>
                        <p className="text-xs text-slate-400">
                          {c.telefone || "Sem telefone"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Orçamentos pendentes
                  </h2>
                </div>
                {dados.orcamentosPendentes.length === 0 ? (
                  <p className="p-5 text-sm text-slate-400">
                    Sem orçamentos pendentes.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {dados.orcamentosPendentes.map((o) => (
                      <li key={o.id} className="px-5 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {o.cliente?.nome ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {o.descricao}
                        </p>
                        <p className="mt-1 text-xs font-medium text-amber-600">
                          {formatarPreco(o.preco)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Trabalhos de hoje
                  </h2>
                </div>
                {dados.trabalhosHoje.length === 0 ? (
                  <p className="p-5 text-sm text-slate-400">
                    Sem trabalhos agendados para hoje.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {dados.trabalhosHoje.map((t) => (
                      <li key={t.id} className="px-5 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {t.cliente?.nome ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatarHora(t.data)}
                          {t.notas ? ` · ${t.notas}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}