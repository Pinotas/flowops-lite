"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

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
  subtitulo,
  valor,
  corValor,
  href,
  comPulso,
  icone,
  corIcone,
}: {
  titulo: string;
  subtitulo: string;
  valor: number;
  corValor: string;
  href: string;
  comPulso?: boolean;
  icone: React.ReactNode;
  corIcone: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-h-[2.5rem]">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[var(--color-ink)]">{titulo}</p>
            {comPulso && valor > 0 && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-ink-faint)]">{subtitulo}</p>
        </div>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${corIcone}1a`, color: corIcone }}
        >
          {icone}
        </span>
      </div>
      <p className={`tabular mt-auto pt-4 text-4xl font-semibold ${corValor}`}>{valor}</p>
    </Link>
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
  const { t } = useLocale();
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] px-5 py-3">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">
          {titulo}
        </h2>
      </div>
      {vazio ? (
        <p className="p-5 text-sm text-[var(--color-ink-faint)]">
          {t.comum.nada}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">{children}</ul>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { t, idioma } = useLocale();
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

  const LOCALE_TAG = { pt: "pt-PT", en: "en-GB", fr: "fr-FR" } as const;
  const hoje = new Date().toLocaleDateString(LOCALE_TAG[idioma], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {t.dashboard.titulo}
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
            <div className="mb-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
              <Cartao
                titulo={t.dashboard.clientes}
                subtitulo={t.dashboard.clientesSub}
                valor={dados.totais.clientes}
                corValor="text-[var(--color-ink)]"
                href="/clientes"
                corIcone="#3730a3"
                icone={
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3.5 17c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
              />
              <Cartao
                titulo={t.dashboard.orcamentosPendentes}
                subtitulo={t.dashboard.orcamentosPendentesSub}
                valor={dados.totais.orcamentosPendentes}
                corValor="text-[var(--color-warning)]"
                href="/orcamentos"
                corIcone="#b45309"
                icone={
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M5 2.5h7l3.5 3.5V17a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 8h6M7 11h6M7 14h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
              />
              <Cartao
                titulo={t.dashboard.trabalhosHoje}
                subtitulo={t.dashboard.trabalhosHojeSub}
                valor={dados.totais.trabalhosHoje}
                corValor="text-[var(--color-accent)]"
                href="/trabalhos"
                comPulso
                corIcone="#15803d"
                icone={
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M7 5.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 4v1.5" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="2.5" y="5.5" width="15" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2.5 10.5h15" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ListaCard
                titulo={t.dashboard.ultimosClientes}
                vazio={dados.clientesNovos.length === 0}
              >
                {dados.clientesNovos.map((c) => (
                  <li key={c.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {c.nome}
                    </p>
                    <p className="text-xs text-[var(--color-ink-faint)]">
                      {c.telefone || t.dashboard.semTelefone}
                    </p>
                  </li>
                ))}
              </ListaCard>

              <ListaCard
                titulo={t.dashboard.orcamentosPendentes}
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
                titulo={t.dashboard.trabalhosDeHoje}
                vazio={dados.trabalhosHoje.length === 0}
              >
                {dados.trabalhosHoje.map((trabalho) => (
                  <li key={trabalho.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {trabalho.cliente?.nome ?? "—"}
                    </p>
                    <p className="tabular text-xs text-[var(--color-ink-faint)]">
                      {formatarHora(trabalho.data)}
                      {trabalho.notas ? ` · ${trabalho.notas}` : ""}
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