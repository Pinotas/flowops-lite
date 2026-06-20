"use client";

import { useEffect, useState } from "react";

type EstadoTrabalho = "AGENDADO" | "EM_CURSO" | "CONCLUIDO" | "CANCELADO";

type Cliente = {
  id: string;
  nome: string;
};

type Trabalho = {
  id: string;
  data: string;
  notas: string | null;
  estado: EstadoTrabalho;
  clienteId: string;
  cliente: Cliente;
};

const ESTADO_LABEL: Record<EstadoTrabalho, string> = {
  AGENDADO: "Agendado",
  EM_CURSO: "Em curso",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const ESTADO_COR: Record<EstadoTrabalho, string> = {
  AGENDADO: "bg-[var(--color-bg)] text-[var(--color-ink-muted)]",
  EM_CURSO: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  CONCLUIDO: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  CANCELADO: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
};

const ESTADOS_CONCLUIDOS: EstadoTrabalho[] = ["CONCLUIDO", "CANCELADO"];

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TrabalhosPage() {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  const [clienteId, setClienteId] = useState("");
  const [data, setData] = useState("");
  const [notas, setNotas] = useState("");

  async function carregarDados() {
    try {
      const [resTrabalhos, resClientes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/customers"),
      ]);
      const dataTrabalhos = await resTrabalhos.json();
      const dataClientes = await resClientes.json();
      setTrabalhos(dataTrabalhos);
      setClientes(dataClientes);
    } catch {
      setErro("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!clienteId) {
      setErro("Escolhe um cliente.");
      return;
    }
    if (!data) {
      setErro("Indica a data do trabalho.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          data,
          notas: notas || null,
        }),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.error || "Erro ao criar trabalho");
      }

      setClienteId("");
      setData("");
      setNotas("");
      await carregarDados();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar trabalho");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMudarEstado(id: string, novoEstado: EstadoTrabalho) {
    setAtualizandoId(id);
    setTrabalhos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: novoEstado } : t))
    );

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: novoEstado }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setErro("Não foi possível atualizar o estado. A repor...");
      await carregarDados();
    } finally {
      setAtualizandoId(null);
    }
  }

  const trabalhosVisiveis = mostrarConcluidos
    ? trabalhos
    : trabalhos.filter((t) => !ESTADOS_CONCLUIDOS.includes(t.estado));

  const totalConcluidos = trabalhos.filter((t) =>
    ESTADOS_CONCLUIDOS.includes(t.estado)
  ).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Trabalhos
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {trabalhosVisiveis.length} trabalho{trabalhosVisiveis.length !== 1 ? "s" : ""}
            {!mostrarConcluidos && totalConcluidos > 0
              ? ` · ${totalConcluidos} fechado${totalConcluidos !== 1 ? "s" : ""} oculto${totalConcluidos !== 1 ? "s" : ""}`
              : ""}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">
              Novo trabalho
            </h2>

            {clientes.length === 0 && !loading ? (
              <p className="text-sm text-[var(--color-ink-muted)]">
                Precisas de ter pelo menos um cliente registado antes de agendar um trabalho.{" "}
                <a href="/clientes" className="font-medium text-[var(--color-accent)] underline">
                  Adicionar cliente
                </a>
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                    Cliente *
                  </label>
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Selecionar cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                    Notas
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className={inputClass}
                    rows={3}
                    placeholder="Ex: Levar escada, confirmar acesso à garagem"
                  />
                </div>

                {erro && (
                  <p className="text-xs font-medium text-[var(--color-danger)]">{erro}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                >
                  {submitting ? "A guardar..." : "Agendar trabalho"}
                </button>
              </form>
            )}
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
              <label className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                <input
                  type="checkbox"
                  checked={mostrarConcluidos}
                  onChange={(e) => setMostrarConcluidos(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--color-border-strong)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                Mostrar fechados (concluídos/cancelados)
                {totalConcluidos > 0 && (
                  <span className="text-[var(--color-ink-faint)]">({totalConcluidos})</span>
                )}
              </label>
            </div>

            {loading ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">A carregar...</p>
            ) : trabalhosVisiveis.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">
                {trabalhos.length === 0
                  ? "Ainda não há trabalhos agendados. Cria o primeiro à esquerda."
                  : "Sem trabalhos para mostrar. Ativa \"Mostrar fechados\" para veres o histórico."}
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Notas</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {trabalhosVisiveis.map((trabalho) => (
                    <tr
                      key={trabalho.id}
                      className="border-b border-[var(--color-border)] last:border-0"
                    >
                      <td className="tabular px-5 py-3 font-medium text-[var(--color-ink)]">
                        {formatarData(trabalho.data)}
                      </td>
                      <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                        {trabalho.cliente?.nome ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-[var(--color-ink-faint)]">
                        {trabalho.notas || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={trabalho.estado}
                          disabled={atualizandoId === trabalho.id}
                          onChange={(e) =>
                            handleMudarEstado(
                              trabalho.id,
                              e.target.value as EstadoTrabalho
                            )
                          }
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] ${ESTADO_COR[trabalho.estado]} ${atualizandoId === trabalho.id ? "opacity-50" : ""}`}
                        >
                          {Object.entries(ESTADO_LABEL).map(([valor, label]) => (
                            <option key={valor} value={valor}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}