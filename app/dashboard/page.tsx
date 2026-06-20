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

function Cartao({
  titulo,
  valor,
  corValor,
  href,
  comPulso,
}: {
  titulo: string;
  valor: number;
  corValor: string;
  href: string;
  comPulso?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">
          {titulo}
        </p>
        {comPulso && valor > 0 && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          </span>
        )}
      </div>
      <p className={`tabular mt-2 text-3xl font-semibold ${corValor}`}>
        {valor}
      </p>
      <Link
        href={href}
        className="mt-2 inline-block text-xs font-medium text-[var(--color-ink-muted)] underline-offset-2 hover:text-[var(--color-accent)] hover:underline"
      >
        Ver todos →
      </Link>
    </div>
  );
}

function ListaCard({
  titulo,
  vazio,
  children,
}: {
  titulo: string;
  vazio: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] px-5 py-3">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">
          {titulo}
        </h2>
      </div>
      {vazio ? (
        <p className="p-5 text-sm text-[var(--color-ink-faint)]">
          Nada por aqui de momento.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">{children}</ul>
      )}
    </div>
  );
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm capitalize text-[var(--color-ink-muted)]">
            {hoje}
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-[var(--color-ink-muted)]">A carregar...</p>
        ) : erro ? (
          <p className="text-sm font-medium text-[var(--color-danger)]">{erro}</p>
        ) : dados ? (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Cartao
                titulo="Clientes"
                valor={dados.totais.clientes}
                corValor="text-[var(--color-ink)]"
                href="/clientes"
              />
              <Cartao
                titulo="Orçamentos pendentes"
                valor={dados.totais.orcamentosPendentes}
                corValor="text-[var(--color-warning)]"
                href="/orcamentos"
              />
              <Cartao
                titulo="Trabalhos hoje"
                valor={dados.totais.trabalhosHoje}
                corValor="text-[var(--color-accent)]"
                href="/trabalhos"
                comPulso
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ListaCard
                titulo="Clientes novos"
                vazio={dados.clientesNovos.length === 0}
              >
                {dados.clientesNovos.map((c) => (
                  <li key={c.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {c.nome}
                    </p>
                    <p className="text-xs text-[var(--color-ink-faint)]">
                      {c.telefone || "Sem telefone"}
                    </p>
                  </li>
                ))}
              </ListaCard>

              <ListaCard
                titulo="Orçamentos pendentes"
                vazio={dados.orcamentosPendentes.length === 0}
              >
                {dados.orcamentosPendentes.map((o) => (
                  <li key={o.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {o.cliente?.nome ?? "—"}
                    </p>
                    <p className="text-xs text-[var(--color-ink-faint)]">
                      {o.descricao}
                    </p>
                    <p className="tabular mt-1 text-xs font-medium text-[var(--color-warning)]">
                      {formatarPreco(o.preco)}
                    </p>
                  </li>
                ))}
              </ListaCard>

              <ListaCard
                titulo="Trabalhos de hoje"
                vazio={dados.trabalhosHoje.length === 0}
              >
                {dados.trabalhosHoje.map((t) => (
                  <li key={t.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {t.cliente?.nome ?? "—"}
                    </p>
                    <p className="tabular text-xs text-[var(--color-ink-faint)]">
                      {formatarHora(t.data)}
                      {t.notas ? ` · ${t.notas}` : ""}
                    </p>
                  </li>
                ))}
              </ListaCard>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}