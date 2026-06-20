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
  AGENDADO: "bg-slate-100 text-slate-700",
  EM_CURSO: "bg-amber-100 text-amber-800",
  CONCLUIDO: "bg-emerald-100 text-emerald-800",
  CANCELADO: "bg-red-100 text-red-700",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Trabalhos</h1>
          <p className="mt-1 text-sm text-slate-500">
            {trabalhos.length} trabalho{trabalhos.length !== 1 ? "s" : ""} agendado{trabalhos.length !== 1 ? "s" : ""}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          {/* Formulário */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Novo trabalho
            </h2>

            {clientes.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">
                Precisas de ter pelo menos um cliente registado antes de agendar um trabalho.{" "}
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
                  <label className="mb-1 block text-xs font-medium text-slate-600">
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
                  <p className="text-xs font-medium text-red-600">{erro}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {submitting ? "A guardar..." : "Agendar trabalho"}
                </button>
              </form>
            )}
          </div>

          {/* Lista */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-6 text-sm text-slate-500">A carregar...</p>
            ) : trabalhos.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                Ainda não há trabalhos agendados. Cria o primeiro à esquerda.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Notas</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {trabalhos.map((trabalho) => (
                    <tr
                      key={trabalho.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {formatarData(trabalho.data)}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {trabalho.cliente?.nome ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-400">
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
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 ${ESTADO_COR[trabalho.estado]} ${atualizandoId === trabalho.id ? "opacity-50" : ""}`}
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