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
  NOVO: "bg-slate-100 text-slate-700",
  ORCAMENTO: "bg-amber-100 text-amber-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  CONCLUIDO: "bg-emerald-100 text-emerald-800",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);

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
    // Atualização otimista: muda já na UI, sem esperar pela resposta
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registado{clientes.length !== 1 ? "s" : ""}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          {/* Formulário */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Novo cliente
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
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
                <label className="mb-1 block text-xs font-medium text-slate-600">
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
                <label className="mb-1 block text-xs font-medium text-slate-600">
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
                <label className="mb-1 block text-xs font-medium text-slate-600">
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
                <p className="text-xs font-medium text-red-600">{erro}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {submitting ? "A guardar..." : "Adicionar cliente"}
              </button>
            </form>
          </div>

          {/* Lista */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-6 text-sm text-slate-500">A carregar...</p>
            ) : clientes.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                Ainda não há clientes. Adiciona o primeiro à esquerda.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Nome</th>
                    <th className="px-5 py-3 font-medium">Contacto</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-900">
                          {cliente.nome}
                        </div>
                        {cliente.morada && (
                          <div className="text-xs text-slate-400">
                            {cliente.morada}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <div>{cliente.telefone || "—"}</div>
                        <div className="text-xs text-slate-400">
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
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 ${ESTADO_COR[cliente.estado]} ${atualizandoId === cliente.id ? "opacity-50" : ""}`}
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