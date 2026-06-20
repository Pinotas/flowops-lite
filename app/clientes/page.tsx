"use client";

import { useEffect, useState } from "react";

type EstadoCliente = "NOVO" | "ORCAMENTO" | "CONFIRMADO" | "CONCLUIDO";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  morada: string | null;
  estado: EstadoCliente;
  createdAt: string;
};

const ESTADO_LABEL: Record<EstadoCliente, string> = {
  NOVO: "Novo",
  ORCAMENTO: "Orçamento",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluído",
};

const ESTADO_COR: Record<EstadoCliente, string> = {
  NOVO: "bg-[var(--color-bg)] text-[var(--color-ink-muted)]",
  ORCAMENTO: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  CONFIRMADO: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  CONCLUIDO: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
};

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [morada, setMorada] = useState("");

  async function carregarClientes() {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setClientes(data);
    } catch {
      setErro("Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro("O nome é obrigatório.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          telefone: telefone || null,
          email: email || null,
          morada: morada || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar cliente");
      }

      setNome("");
      setTelefone("");
      setEmail("");
      setMorada("");
      await carregarClientes();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar cliente");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMudarEstado(id: string, novoEstado: EstadoCliente) {
    setAtualizandoId(id);
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: novoEstado } : c))
    );

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: novoEstado }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setErro("Não foi possível atualizar o estado. A repor...");
      await carregarClientes();
    } finally {
      setAtualizandoId(null);
    }
  }

  const clientesVisiveis = mostrarConcluidos
    ? clientes
    : clientes.filter((c) => c.estado !== "CONCLUIDO");

  const totalConcluidos = clientes.filter(
    (c) => c.estado === "CONCLUIDO"
  ).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {clientesVisiveis.length} cliente{clientesVisiveis.length !== 1 ? "s" : ""}
            {!mostrarConcluidos && totalConcluidos > 0
              ? ` · ${totalConcluidos} concluído${totalConcluidos !== 1 ? "s" : ""} oculto${totalConcluidos !== 1 ? "s" : ""}`
              : ""}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">
              Novo cliente
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                  Nome *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputClass}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                  Telefone
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className={inputClass}
                  placeholder="912 345 678"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="cliente@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                  Morada
                </label>
                <input
                  type="text"
                  value={morada}
                  onChange={(e) => setMorada(e.target.value)}
                  className={inputClass}
                  placeholder="Rua, número, cidade"
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
                {submitting ? "A guardar..." : "Adicionar cliente"}
              </button>
            </form>
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
                Mostrar concluídos
                {totalConcluidos > 0 && (
                  <span className="text-[var(--color-ink-faint)]">({totalConcluidos})</span>
                )}
              </label>
            </div>

            {loading ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">A carregar...</p>
            ) : clientesVisiveis.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">
                {clientes.length === 0
                  ? "Ainda não há clientes. Adiciona o primeiro à esquerda."
                  : "Sem clientes para mostrar. Ativa \"Mostrar concluídos\" para veres o histórico."}
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                    <th className="px-5 py-3 font-medium">Nome</th>
                    <th className="px-5 py-3 font-medium">Contacto</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesVisiveis.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-b border-[var(--color-border)] last:border-0"
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium text-[var(--color-ink)]">
                          {cliente.nome}
                        </div>
                        {cliente.morada && (
                          <div className="text-xs text-[var(--color-ink-faint)]">
                            {cliente.morada}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                        <div>{cliente.telefone || "—"}</div>
                        <div className="text-xs text-[var(--color-ink-faint)]">
                          {cliente.email || ""}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={cliente.estado}
                          disabled={atualizandoId === cliente.id}
                          onChange={(e) =>
                            handleMudarEstado(
                              cliente.id,
                              e.target.value as EstadoCliente
                            )
                          }
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] ${ESTADO_COR[cliente.estado]} ${atualizandoId === cliente.id ? "opacity-50" : ""}`}
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