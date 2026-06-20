"use client";

import { useEffect, useState } from "react";

type EstadoOrcamento = "PENDENTE" | "ENVIADO" | "ACEITE" | "REJEITADO";

type Cliente = {
  id: string;
  nome: string;
};

type Orcamento = {
  id: string;
  descricao: string;
  preco: number;
  estado: EstadoOrcamento;
  createdAt: string;
  clienteId: string;
  cliente: Cliente;
};

const ESTADO_LABEL: Record<EstadoOrcamento, string> = {
  PENDENTE: "Pendente",
  ENVIADO: "Enviado",
  ACEITE: "Aceite",
  REJEITADO: "Rejeitado",
};

const ESTADO_COR: Record<EstadoOrcamento, string> = {
  PENDENTE: "bg-[var(--color-bg)] text-[var(--color-ink-muted)]",
  ENVIADO: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  ACEITE: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  REJEITADO: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
};

const ESTADOS_CONCLUIDOS: EstadoOrcamento[] = ["ACEITE", "REJEITADO"];

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

function formatarPreco(preco: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(preco);
}

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  const [clienteId, setClienteId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");

  async function carregarDados() {
    try {
      const [resOrcamentos, resClientes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/customers"),
      ]);
      const dataOrcamentos = await resOrcamentos.json();
      const dataClientes = await resClientes.json();
      setOrcamentos(dataOrcamentos);
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
    if (!descricao.trim()) {
      setErro("A descrição é obrigatória.");
      return;
    }
    if (!preco || parseFloat(preco) <= 0) {
      setErro("Indica um preço válido.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          descricao,
          preco: parseFloat(preco),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar orçamento");
      }

      setClienteId("");
      setDescricao("");
      setPreco("");
      await carregarDados();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar orçamento");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMudarEstado(id: string, novoEstado: EstadoOrcamento) {
    setAtualizandoId(id);
    setOrcamentos((prev) =>
      prev.map((o) => (o.id === id ? { ...o, estado: novoEstado } : o))
    );

    try {
      const res = await fetch(`/api/budgets/${id}`, {
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

  const orcamentosVisiveis = mostrarConcluidos
    ? orcamentos
    : orcamentos.filter((o) => !ESTADOS_CONCLUIDOS.includes(o.estado));

  const totalConcluidos = orcamentos.filter((o) =>
    ESTADOS_CONCLUIDOS.includes(o.estado)
  ).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Orçamentos
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {orcamentosVisiveis.length} orçamento{orcamentosVisiveis.length !== 1 ? "s" : ""}
            {!mostrarConcluidos && totalConcluidos > 0
              ? ` · ${totalConcluidos} fechado${totalConcluidos !== 1 ? "s" : ""} oculto${totalConcluidos !== 1 ? "s" : ""}`
              : ""}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">
              Novo orçamento
            </h2>

            {clientes.length === 0 && !loading ? (
              <p className="text-sm text-[var(--color-ink-muted)]">
                Precisas de ter pelo menos um cliente registado antes de criar um orçamento.{" "}
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
                    Descrição *
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className={inputClass}
                    rows={3}
                    placeholder="Ex: Pintura da sala e corredor"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                    Preço (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    className={inputClass}
                    placeholder="0.00"
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
                  {submitting ? "A guardar..." : "Criar orçamento"}
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
                Mostrar fechados (aceites/rejeitados)
                {totalConcluidos > 0 && (
                  <span className="text-[var(--color-ink-faint)]">({totalConcluidos})</span>
                )}
              </label>
            </div>

            {loading ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">A carregar...</p>
            ) : orcamentosVisiveis.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">
                {orcamentos.length === 0
                  ? "Ainda não há orçamentos. Cria o primeiro à esquerda."
                  : "Sem orçamentos para mostrar. Ativa \"Mostrar fechados\" para veres o histórico."}
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Descrição</th>
                    <th className="px-5 py-3 font-medium">Preço</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orcamentosVisiveis.map((orcamento) => (
                    <tr
                      key={orcamento.id}
                      className="border-b border-[var(--color-border)] last:border-0"
                    >
                      <td className="px-5 py-3 font-medium text-[var(--color-ink)]">
                        {orcamento.cliente?.nome ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                        {orcamento.descricao}
                      </td>
                      <td className="tabular px-5 py-3 font-medium text-[var(--color-ink)]">
                        {formatarPreco(orcamento.preco)}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={orcamento.estado}
                          disabled={atualizandoId === orcamento.id}
                          onChange={(e) =>
                            handleMudarEstado(
                              orcamento.id,
                              e.target.value as EstadoOrcamento
                            )
                          }
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] ${ESTADO_COR[orcamento.estado]} ${atualizandoId === orcamento.id ? "opacity-50" : ""}`}
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