"use client";

import { useEffect, useState } from "react";

type EstadoTrabalho = "AGENDADO" | "EM_CURSO" | "CONCLUIDO" | "CANCELADO";
type SubFiltro = "TODOS" | "CONCLUIDO" | "CANCELADO";

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

const LINHA_BG: Record<EstadoTrabalho, string | undefined> = {
  AGENDADO: undefined,
  EM_CURSO: undefined,
  CONCLUIDO: "var(--color-success-strong)",
  CANCELADO: "var(--color-danger-strong)",
};

const ESTADOS_TERMINADOS: EstadoTrabalho[] = ["CONCLUIDO", "CANCELADO"];

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

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
  const [verTerminados, setVerTerminados] = useState(false);
  const [subFiltro, setSubFiltro] = useState<SubFiltro>("TODOS");

  const [clienteId, setClienteId] = useState("");
  const [data, setData] = useState("");
  const [notas, setNotas] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editClienteId, setEditClienteId] = useState("");
  const [editData, setEditData] = useState("");
  const [editNotas, setEditNotas] = useState("");
  const [guardandoEdicao, setGuardandoEdicao] = useState(false);
  const [apagandoId, setApagandoId] = useState<string | null>(null);

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
    if (data < hojeISO()) {
      setErro("A data do trabalho não pode ser no passado.");
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

  function iniciarEdicao(trabalho: Trabalho) {
    setEditandoId(trabalho.id);
    setEditClienteId(trabalho.clienteId);
    setEditData(trabalho.data.slice(0, 10));
    setEditNotas(trabalho.notas || "");
    setErro(null);
  }

  function cancelarEdicao() {
    setEditandoId(null);
  }

  async function handleGuardarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoId) return;
    setErro(null);

    if (!editClienteId || !editData) {
      setErro("Cliente e data são obrigatórios.");
      return;
    }

    setGuardandoEdicao(true);
    try {
      const res = await fetch(`/api/jobs/${editandoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: editClienteId,
          data: editData,
          notas: editNotas || null,
        }),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.error || "Erro ao atualizar trabalho");
      }

      setEditandoId(null);
      await carregarDados();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao atualizar trabalho");
    } finally {
      setGuardandoEdicao(false);
    }
  }

  async function handleApagar(trabalho: Trabalho) {
    if (
      !window.confirm(
        `Apagar o trabalho de ${formatarData(trabalho.data)}? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setErro(null);
    setApagandoId(trabalho.id);
    try {
      const res = await fetch(`/api/jobs/${trabalho.id}`, { method: "DELETE" });
      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.error || "Erro ao apagar trabalho");
      }
      await carregarDados();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao apagar trabalho");
    } finally {
      setApagandoId(null);
    }
  }

  function handleToggleTerminados() {
    setVerTerminados((v) => !v);
    setSubFiltro("TODOS");
  }

  const trabalhosVisiveis = trabalhos.filter((t) => {
    const terminado = ESTADOS_TERMINADOS.includes(t.estado);
    if (verTerminados) {
      if (!terminado) return false;
      if (subFiltro !== "TODOS" && t.estado !== subFiltro) return false;
      return true;
    }
    return !terminado;
  });

  const totalConcluidos = trabalhos.filter(
    (t) => t.estado === "CONCLUIDO"
  ).length;
  const totalCancelados = trabalhos.filter(
    (t) => t.estado === "CANCELADO"
  ).length;
  const totalTerminados = totalConcluidos + totalCancelados;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Trabalhos
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {trabalhosVisiveis.length} trabalho{trabalhosVisiveis.length !== 1 ? "s" : ""}
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
                    min={hojeISO()}
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
            <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] px-5 py-3">
              <button
                onClick={handleToggleTerminados}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  verTerminados
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-bg)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Trabalhos terminados
                {totalTerminados > 0 && ` (${totalTerminados})`}
              </button>

              {verTerminados && (
                <div className="flex items-center gap-1">
                  {(
                    [
                      { valor: "TODOS", label: "Todos" },
                      { valor: "CONCLUIDO", label: "Concluídos" },
                      { valor: "CANCELADO", label: "Cancelados" },
                    ] as { valor: SubFiltro; label: string }[]
                  ).map((opcao) => (
                    <button
                      key={opcao.valor}
                      onClick={() => setSubFiltro(opcao.valor)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        subFiltro === opcao.valor
                          ? opcao.valor === "CONCLUIDO"
                            ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                            : opcao.valor === "CANCELADO"
                            ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
                            : "bg-[var(--color-ink)] text-white"
                          : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
                      }`}
                    >
                      {opcao.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">A carregar...</p>
            ) : trabalhosVisiveis.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">
                {trabalhos.length === 0
                  ? "Ainda não há trabalhos agendados. Cria o primeiro à esquerda."
                  : verTerminados
                  ? "Sem trabalhos terminados com este filtro."
                  : "Sem trabalhos para mostrar."}
              </p>
            ) : verTerminados ? (
              <div className="space-y-2 p-4">
                {trabalhosVisiveis.map((trabalho) => (
                  <div
                    key={trabalho.id}
                    style={{ backgroundColor: LINHA_BG[trabalho.estado] }}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-full px-5 py-3"
                  >
                    <div className="flex flex-1 items-center gap-4 min-w-0">
                      <span className="tabular font-medium text-[var(--color-ink)] whitespace-nowrap">
                        {formatarData(trabalho.data)}
                      </span>
                      <span className="text-sm text-[var(--color-ink-muted)] whitespace-nowrap">
                        {trabalho.cliente?.nome ?? "—"}
                      </span>
                      <span className="text-sm text-[var(--color-ink-faint)] truncate">
                        {trabalho.notas || ""}
                      </span>
                    </div>
                    <select
                      value={trabalho.estado}
                      disabled={atualizandoId === trabalho.id}
                      onChange={(e) =>
                        handleMudarEstado(
                          trabalho.id,
                          e.target.value as EstadoTrabalho
                        )
                      }
                      className={`cursor-pointer rounded-full border-0 bg-white/60 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] ${atualizandoId === trabalho.id ? "opacity-50" : ""}`}
                    >
                      {Object.entries(ESTADO_LABEL).map(([valor, label]) => (
                        <option key={valor} value={valor}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Notas</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {trabalhosVisiveis.map((trabalho) =>
                    editandoId === trabalho.id ? (
                      <tr key={trabalho.id} className="border-b border-[var(--color-border)] last:border-0 bg-[var(--color-bg)]">
                        <td colSpan={5} className="px-5 py-4">
                          <form onSubmit={handleGuardarEdicao} className="grid gap-2 sm:grid-cols-3">
                            <select
                              value={editClienteId}
                              onChange={(e) => setEditClienteId(e.target.value)}
                              className={inputClass}
                            >
                              {clientes.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.nome}
                                </option>
                              ))}
                            </select>
                            <input
                              type="date"
                              value={editData}
                              onChange={(e) => setEditData(e.target.value)}
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={editNotas}
                              onChange={(e) => setEditNotas(e.target.value)}
                              className={inputClass}
                              placeholder="Notas"
                            />
                            {erro && (
                              <p className="col-span-3 text-xs font-medium text-[var(--color-danger)]">{erro}</p>
                            )}
                            <div className="col-span-3 flex gap-2">
                              <button
                                type="submit"
                                disabled={guardandoEdicao}
                                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                              >
                                {guardandoEdicao ? "A guardar..." : "Guardar"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelarEdicao}
                                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)]"
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
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
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => iniciarEdicao(trabalho)}
                              className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleApagar(trabalho)}
                              disabled={apagandoId === trabalho.id}
                              className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
                            >
                              {apagandoId === trabalho.id ? "A apagar..." : "Apagar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}