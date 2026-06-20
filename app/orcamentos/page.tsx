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
  PENDENTE: "bg-slate-100 text-slate-700",
  ENVIADO: "bg-amber-100 text-amber-800",
  ACEITE: "bg-emerald-100 text-emerald-800",
  REJEITADO: "bg-red-100 text-red-700",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Orçamentos</h1>
          <p className="mt-1 text-sm text-slate-500">
            {orcamentos.length} orçamento{orcamentos.length !== 1 ? "s" : ""} registado{orcamentos.length !== 1 ? "s" : ""}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          {/* Formulário */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Novo orçamento
            </h2>

            {clientes.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">
                Precisas de ter pelo menos um cliente registado antes de criar um orçamento.{" "}
                <a href="/clientes" className="font-medium text-slate-900 underline">
                  Adicionar cliente
                </a>
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
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
                  <label className="mb-1 block text-xs font-medium text-slate-600">
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
                  <label className="mb-1 block text-xs font-medium text-slate-600">
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
                  <p className="text-xs font-medium text-red-600">{erro}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {submitting ? "A guardar..." : "Criar orçamento"}
                </button>
              </form>
            )}
          </div>

          {/* Lista */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-6 text-sm text-slate-500">A carregar...</p>
            ) : orcamentos.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                Ainda não há orçamentos. Cria o primeiro à esquerda.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Descrição</th>
                    <th className="px-5 py-3 font-medium">Preço</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orcamentos.map((orcamento) => (
                    <tr
                      key={orcamento.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {orcamento.cliente?.nome ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {orcamento.descricao}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900">
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
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 ${ESTADO_COR[orcamento.estado]} ${atualizandoId === orcamento.id ? "opacity-50" : ""}`}
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