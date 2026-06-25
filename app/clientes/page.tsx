"use client";

import { useEffect, useState } from "react";
import { encontrarPaisPorCodigo } from "@/lib/paises";
import { SeletorPais } from "@/components/SeletorPais";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  morada: string | null;
  createdAt: string;
};

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [codigoPais, setCodigoPais] = useState("PT");
  const [telefoneNumero, setTelefoneNumero] = useState("");
  const [email, setEmail] = useState("");
  const [morada, setMorada] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMorada, setEditMorada] = useState("");
  const [guardandoEdicao, setGuardandoEdicao] = useState(false);
  const [apagandoId, setApagandoId] = useState<string | null>(null);

  const paisSelecionado = encontrarPaisPorCodigo(codigoPais);

  function handleCodigoPaisChange(novoCodigo: string) {
    setCodigoPais(novoCodigo);
    const novoPais = encontrarPaisPorCodigo(novoCodigo);
    setTelefoneNumero((prev) => prev.slice(0, novoPais.digitos));
  }

  function handleTelefoneChange(valor: string) {
    const apenasDigitos = valor.replace(/\D/g, "").slice(0, paisSelecionado.digitos);
    setTelefoneNumero(apenasDigitos);
  }

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

    if (telefoneNumero && telefoneNumero.length !== paisSelecionado.digitos) {
      setErro(
        `O número de telefone para ${paisSelecionado.nome} deve ter ${paisSelecionado.digitos} dígitos.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          telefone: telefoneNumero ? `${paisSelecionado.indicativo} ${telefoneNumero}` : null,
          email: email || null,
          morada: morada || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar cliente");
      }

      setNome("");
      setCodigoPais("PT");
      setTelefoneNumero("");
      setEmail("");
      setMorada("");
      await carregarClientes();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar cliente");
    } finally {
      setSubmitting(false);
    }
  }

  function iniciarEdicao(cliente: Cliente) {
    setEditandoId(cliente.id);
    setEditNome(cliente.nome);
    setEditTelefone(cliente.telefone || "");
    setEditEmail(cliente.email || "");
    setEditMorada(cliente.morada || "");
    setErro(null);
  }

  function cancelarEdicao() {
    setEditandoId(null);
  }

  async function handleGuardarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoId) return;
    setErro(null);

    if (!editNome.trim()) {
      setErro("O nome é obrigatório.");
      return;
    }

    setGuardandoEdicao(true);
    try {
      const res = await fetch(`/api/customers/${editandoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editNome,
          telefone: editTelefone || null,
          email: editEmail || null,
          morada: editMorada || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar cliente");
      }

      setEditandoId(null);
      await carregarClientes();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao atualizar cliente");
    } finally {
      setGuardandoEdicao(false);
    }
  }

  async function handleApagar(cliente: Cliente) {
    if (
      !window.confirm(
        `Apagar o cliente "${cliente.nome}"? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setErro(null);
    setApagandoId(cliente.id);
    try {
      const res = await fetch(`/api/customers/${cliente.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao apagar cliente");
      }

      await carregarClientes();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao apagar cliente");
    } finally {
      setApagandoId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
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
                <div className="flex gap-2">
                  <SeletorPais codigoPais={codigoPais} onChange={handleCodigoPaisChange} />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={telefoneNumero}
                    onChange={(e) => handleTelefoneChange(e.target.value)}
                    className={`${inputClass} !w-auto min-w-0 flex-1`}
                    placeholder={`${paisSelecionado.digitos} dígitos`}
                  />
                </div>
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
            {loading ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">A carregar...</p>
            ) : clientes.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-ink-muted)]">
                Ainda não há clientes. Adiciona o primeiro à esquerda.
              </p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                    <th className="px-5 py-3 font-medium">Nome</th>
                    <th className="px-5 py-3 font-medium">Contacto</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) =>
                    editandoId === cliente.id ? (
                      <tr key={cliente.id} className="border-b border-[var(--color-border)] last:border-0 bg-[var(--color-bg)]">
                        <td colSpan={3} className="px-5 py-4">
                          <form onSubmit={handleGuardarEdicao} className="grid gap-2 sm:grid-cols-2">
                            <input
                              type="text"
                              value={editNome}
                              onChange={(e) => setEditNome(e.target.value)}
                              className={inputClass}
                              placeholder="Nome"
                            />
                            <input
                              type="text"
                              value={editTelefone}
                              onChange={(e) => setEditTelefone(e.target.value)}
                              className={inputClass}
                              placeholder="Telefone"
                            />
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className={inputClass}
                              placeholder="Email"
                            />
                            <input
                              type="text"
                              value={editMorada}
                              onChange={(e) => setEditMorada(e.target.value)}
                              className={inputClass}
                              placeholder="Morada"
                            />
                            {erro && (
                              <p className="col-span-2 text-xs font-medium text-[var(--color-danger)]">{erro}</p>
                            )}
                            <div className="col-span-2 flex gap-2">
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
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => iniciarEdicao(cliente)}
                              className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleApagar(cliente)}
                              disabled={apagandoId === cliente.id}
                              className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
                            >
                              {apagandoId === cliente.id ? "A apagar..." : "Apagar"}
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