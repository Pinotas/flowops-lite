"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type EstadoTrabalho = "AGENDADO" | "EM_CURSO" | "CONCLUIDO" | "CANCELADO";

type Trabalho = {
  id: string;
  data: string;
  notas: string | null;
  estado: EstadoTrabalho;
  clienteId: string;
  cliente: { id: string; nome: string };
};

const LOCALE_TAG = { pt: "pt-PT", en: "en-GB", fr: "fr-FR" } as const;

const PONTO_COR: Record<EstadoTrabalho, string> = {
  AGENDADO: "#71717a",
  EM_CURSO: "#b45309",
  CONCLUIDO: "#15803d",
  CANCELADO: "#b91c1c",
};

function dataISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarioTrabalhos({
  trabalhos,
  estadoLabel,
  estadoCor,
  onEditar,
  onApagar,
  onMudarEstado,
  apagandoId = null,
  atualizandoId = null,
  somenteLeitura = false,
  compacto = false,
}: {
  trabalhos: Trabalho[];
  estadoLabel: Record<EstadoTrabalho, string>;
  estadoCor: Record<EstadoTrabalho, string>;
  onEditar?: (t: Trabalho) => void;
  onApagar?: (t: Trabalho) => void;
  onMudarEstado?: (id: string, estado: EstadoTrabalho) => void;
  apagandoId?: string | null;
  atualizandoId?: string | null;
  somenteLeitura?: boolean;
  compacto?: boolean;
}) {
  const { t, idioma } = useLocale();
  const locale = LOCALE_TAG[idioma];
  const hojeISO = dataISO(new Date());

  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(hojeISO);

  const porDia = useMemo(() => {
    const mapa = new Map<string, Trabalho[]>();
    for (const trabalho of trabalhos) {
      const chave = trabalho.data.slice(0, 10);
      const lista = mapa.get(chave) ?? [];
      lista.push(trabalho);
      mapa.set(chave, lista);
    }
    return mapa;
  }, [trabalhos]);

  const celulas = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDiaSemana = (new Date(ano, mes, 1).getDay() + 6) % 7; // 0 = segunda
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    const lista: { data: Date | null }[] = [];
    for (let i = 0; i < primeiroDiaSemana; i++) lista.push({ data: null });
    for (let dia = 1; dia <= diasNoMes; dia++) lista.push({ data: new Date(ano, mes, dia) });
    while (lista.length % 7 !== 0) lista.push({ data: null });
    return lista;
  }, [mesAtual]);

  const labelMes = mesAtual.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const labelsDiaSemana = [...Array(7)].map((_, i) =>
    new Date(2024, 0, i + 1).toLocaleDateString(locale, { weekday: "short" })
  );

  const trabalhosDoDia = diaSelecionado ? porDia.get(diaSelecionado) ?? [] : [];

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)]"
            aria-label="Mês anterior"
          >
            ‹
          </button>
          <span className="w-36 text-center text-sm font-semibold capitalize text-[var(--color-ink)]">
            {labelMes}
          </span>
          <button
            onClick={() => setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)]"
            aria-label="Mês seguinte"
          >
            ›
          </button>
        </div>
        <button
          onClick={() => {
            const hoje = new Date();
            setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
            setDiaSelecionado(hojeISO);
          }}
          className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-ink-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          {t.trabalhos.hoje}
        </button>
      </div>

      <div className="grid grid-cols-7 border-t border-[var(--color-border)] text-center text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">
        {labelsDiaSemana.map((label) => (
          <div key={label} className="border-b border-[var(--color-border)] py-2">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {celulas.map((celula, i) => {
          const alturaVazia = compacto ? "h-12 sm:h-14" : "h-20 sm:h-24";
          if (!celula.data) {
            return <div key={i} className={`${alturaVazia} border-b border-r border-[var(--color-border)] bg-[var(--color-bg)]`} />;
          }
          const chave = dataISO(celula.data);
          const itens = porDia.get(chave) ?? [];
          const ehHoje = chave === hojeISO;
          const ehSelecionado = chave === diaSelecionado;
          const maxItens = compacto ? 1 : 2;

          return (
            <button
              key={i}
              onClick={() => setDiaSelecionado(chave)}
              className={`flex ${compacto ? "h-12 sm:h-14" : "h-20 sm:h-24"} flex-col items-stretch border-b border-r border-[var(--color-border)] p-1.5 text-left transition-colors ${
                ehSelecionado ? "bg-[var(--color-accent-soft)]" : "hover:bg-[var(--color-bg)]"
              }`}
            >
              <span
                className={`tabular self-start text-xs font-medium ${
                  ehHoje
                    ? "flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-ink-muted)]"
                }`}
              >
                {celula.data.getDate()}
              </span>
              <div className="mt-1 flex-1 space-y-0.5 overflow-hidden">
                {itens.slice(0, maxItens).map((trabalho) => (
                  <div
                    key={trabalho.id}
                    className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-white"
                    style={{ backgroundColor: PONTO_COR[trabalho.estado] }}
                  >
                    {trabalho.cliente?.nome ?? "—"}
                  </div>
                ))}
                {itens.length > maxItens && (
                  <div className="px-1 text-[10px] text-[var(--color-ink-faint)]">
                    {t.trabalhos.maisN(itens.length - maxItens)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-[var(--color-border)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
          {diaSelecionado &&
            new Date(diaSelecionado + "T00:00:00").toLocaleDateString(locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
        </h3>

        {trabalhosDoDia.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-faint)]">{t.trabalhos.semTrabalhosNoDia}</p>
        ) : (
          <div className="space-y-2">
            {trabalhosDoDia.map((trabalho) => (
              <div
                key={trabalho.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-ink)]">{trabalho.cliente?.nome ?? "—"}</p>
                  {trabalho.notas && (
                    <p className="truncate text-sm text-[var(--color-ink-faint)]">{trabalho.notas}</p>
                  )}
                </div>
                {somenteLeitura ? (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${estadoCor[trabalho.estado]}`}
                  >
                    {estadoLabel[trabalho.estado]}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={trabalho.estado}
                      disabled={atualizandoId === trabalho.id}
                      onChange={(e) => onMudarEstado?.(trabalho.id, e.target.value as EstadoTrabalho)}
                      className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] ${estadoCor[trabalho.estado]} ${atualizandoId === trabalho.id ? "opacity-50" : ""}`}
                    >
                      {Object.entries(estadoLabel).map(([valor, label]) => (
                        <option key={valor} value={valor}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {trabalho.estado !== "CONCLUIDO" && trabalho.estado !== "CANCELADO" && (
                      <button
                        onClick={() => onEditar?.(trabalho)}
                        className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        {t.comum.editar}
                      </button>
                    )}
                    <button
                      onClick={() => onApagar?.(trabalho)}
                      disabled={apagandoId === trabalho.id}
                      className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
                    >
                      {apagandoId === trabalho.id ? t.comum.aApagar : t.comum.apagar}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
