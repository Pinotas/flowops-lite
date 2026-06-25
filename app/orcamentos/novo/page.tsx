"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Cliente = {
  id: string;
  nome: string;
  email: string | null;
};

type LinhaFormulario = {
  descricao: string;
  quantidade: string;
  precoUnit: string;
};

function calcularTotal(linhas: { quantidade: number; precoUnit: number }[]) {
  return linhas.reduce(
    (soma, linha) => soma + linha.quantidade * linha.precoUnit,
    0
  );
}

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

function formatarPreco(preco: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(preco);
}

export default function NovoOrcamentoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState("");
  const [linhasForm, setLinhasForm] = useState<LinhaFormulario[]>([
    { descricao: "", quantidade: "1", precoUnit: "" },
  ]);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then(setClientes)
      .catch(() => setErro("Não foi possível carregar os clientes."))
      .finally(() => setLoading(false));
  }, []);

  function handleAdicionarLinha() {
    setLinhasForm((prev) => [
      ...prev,
      { descricao: "", quantidade: "1", precoUnit: "" },
    ]);
  }

  function handleRemoverLinha(index: number) {
    setLinhasForm((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAlterarLinha(
    index: number,
    campo: keyof LinhaFormulario,
    valor: string
  ) {
    setLinhasForm((prev) =>
      prev.map((linha, i) => (i === index ? { ...linha, [campo]: valor } : linha))
    );
  }

  const totalFormulario = calcularTotal(
    linhasForm.map((l) => ({
      quantidade: parseFloat(l.quantidade) || 0,
      precoUnit: parseFloat(l.precoUnit) || 0,
    }))
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!clienteId) {
      setErro("Escolhe um cliente.");
      return;
    }
    if (linhasForm.some((l) => !l.descricao.trim())) {
      setErro("Todas as linhas precisam de descrição.");
      return;
    }
    if (linhasForm.some((l) => !l.precoUnit || parseFloat(l.precoUnit) <= 0)) {
      setErro("Indica um preço unitário válido em cada linha.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          linhas: linhasForm.map((l) => ({
            descricao: l.descricao,
            quantidade: parseFloat(l.quantidade) || 1,
            precoUnit: parseFloat(l.precoUnit),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar orçamento");
      }

      router.push("/orcamentos");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar orçamento");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-8">
          <a
            href="/orcamentos"
            className="text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            ← Voltar a orçamentos
          </a>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Novo orçamento
          </h1>
        </header>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
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
              <div className="space-y-2">
                <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                  Linhas *
                </label>
                {linhasForm.map((linha, index) => (
                  <div
                    key={index}
                    className="space-y-1.5 rounded-lg border border-[var(--color-border)] p-2.5"
                  >
                    <input
                      type="text"
                      value={linha.descricao}
                      onChange={(e) =>
                        handleAlterarLinha(index, "descricao", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Ex: Pintura da sala e corredor"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={linha.quantidade}
                        onChange={(e) =>
                          handleAlterarLinha(index, "quantidade", e.target.value)
                        }
                        className={`${inputClass} w-20`}
                        placeholder="Qtd"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={linha.precoUnit}
                        onChange={(e) =>
                          handleAlterarLinha(index, "precoUnit", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Preço unit. (€)"
                      />
                      {linhasForm.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoverLinha(index)}
                          className="shrink-0 rounded-md px-2 py-2 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAdicionarLinha}
                  className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  + Adicionar linha
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] px-3 py-2">
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">
                  Total
                </span>
                <span className="tabular text-sm font-semibold text-[var(--color-ink)]">
                  {formatarPreco(totalFormulario)}
                </span>
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
      </div>
    </div>
  );
}
