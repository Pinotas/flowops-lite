"use client";

import { useEffect, useState } from "react";
import { PdfViewer } from "@/components/PdfViewer";
import PageHeader from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";

type EstadoOrcamento = "PENDENTE" | "ENVIADO" | "ACEITE" | "REJEITADO";
type SubFiltro = "TODOS" | "ACEITE" | "REJEITADO";

type Cliente = {
  id: string;
  nome: string;
  email: string | null;
};

type LinhaOrcamento = {
  id: string;
  descricao: string;
  quantidade: number;
  precoUnit: number;
  ordem: number;
};

type Orcamento = {
  id: string;
  estado: EstadoOrcamento;
  createdAt: string;
  clienteId: string;
  cliente: Cliente;
  linhas: LinhaOrcamento[];
  tokenPublico: string;
};

function calcularTotal(linhas: { quantidade: number; precoUnit: number }[]) {
  return linhas.reduce(
    (soma, linha) => soma + linha.quantidade * linha.precoUnit,
    0
  );
}

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

const LINHA_BG: Record<EstadoOrcamento, string | undefined> = {
  PENDENTE: undefined,
  ENVIADO: undefined,
  ACEITE: "var(--color-success-strong)",
  REJEITADO: "var(--color-danger-strong)",
};

const ESTADOS_TERMINADOS: EstadoOrcamento[] = ["ACEITE", "REJEITADO"];

function formatarPreco(preco: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(preco);
}

export default function OrcamentosPage() {
  const { t } = useLocale();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [apagandoId, setApagandoId] = useState<string | null>(null);
  const [verTerminados, setVerTerminados] = useState(false);
  const [subFiltro, setSubFiltro] = useState<SubFiltro>("TODOS");
  const [preview, setPreview] = useState<Orcamento | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function carregarDados() {
    try {
      const res = await fetch("/api/budgets");
      const data = await res.json();
      setOrcamentos(data);
    } catch {
      setErro("Não foi possível carregar os orçamentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

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

  async function handleEnviarEmail(orcamento: Orcamento) {
    setErro(null);
    setAviso(null);

    if (!orcamento.cliente.email) {
      setErro(
        `${orcamento.cliente.nome} não tem email registado. Adiciona um email ao cliente primeiro.`
      );
      return;
    }

    setEnviandoId(orcamento.id);
    try {
      const res = await fetch(`/api/budgets/${orcamento.id}/send`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar o email");
      }

      setAviso(`Orçamento enviado para ${orcamento.cliente.email}.`);
      await carregarDados();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar o email");
    } finally {
      setEnviandoId(null);
    }
  }

  async function abrirPreview(orcamento: Orcamento) {
    setPreview(orcamento);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/budgets/${orcamento.id}/pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setErro("Não foi possível carregar a pré-visualização do PDF.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleApagar(orcamento: Orcamento) {
    if (
      !window.confirm(
        `Apagar o orçamento de "${orcamento.cliente?.nome ?? "—"}"? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setErro(null);
    setApagandoId(orcamento.id);
    try {
      const res = await fetch(`/api/budgets/${orcamento.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao apagar orçamento");
      }
      await carregarDados();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao apagar orçamento");
    } finally {
      setApagandoId(null);
    }
  }

  function fecharPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreview(null);
    setPreviewUrl(null);
  }

  async function handleCopiarLink(orcamento: Orcamento) {
    const link = `${window.location.origin}/proposta/${orcamento.tokenPublico}`;
    try {
      await navigator.clipboard.writeText(link);
      setAviso("Link copiado para a área de transferência.");
    } catch {
      setErro("Não foi possível copiar o link.");
    }
  }

  function handleToggleTerminados() {
    setVerTerminados((v) => !v);
    setSubFiltro("TODOS");
  }

  const orcamentosVisiveis = orcamentos.filter((o) => {
    const terminado = ESTADOS_TERMINADOS.includes(o.estado);
    if (verTerminados) {
      if (!terminado) return false;
      if (subFiltro !== "TODOS" && o.estado !== subFiltro) return false;
      return true;
    }
    return !terminado;
  });

  const totalAceites = orcamentos.filter((o) => o.estado === "ACEITE").length;
  const totalRejeitados = orcamentos.filter(
    (o) => o.estado === "REJEITADO"
  ).length;
  const totalTerminados = totalAceites + totalRejeitados;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <PageHeader
          titulo={t.orcamentos.titulo}
          subtitulo={t.orcamentos.contagem(orcamentosVisiveis.length)}
          corIcone="#b45309"
          icone={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 2.5h7l3.5 3.5V17a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 8h6M7 11h6M7 14h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          acoes={
            <a
              href="/orcamentos/novo"
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              {t.orcamentos.novoOrcamento}
            </a>
          }
        />

        {aviso && (
          <div className="mb-4 rounded-lg border border-[var(--color-success-soft)] bg-[var(--color-success-soft)] px-4 py-2.5 text-sm font-medium text-[var(--color-success)]">
            {aviso}
          </div>
        )}
        {erro && (
          <div className="mb-4 rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--color-danger)]">
            {erro}
          </div>
        )}

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
              Orçamentos terminados
              {totalTerminados > 0 && ` (${totalTerminados})`}
            </button>

            {verTerminados && (
              <div className="flex items-center gap-1">
                {(
                  [
                    { valor: "TODOS", label: "Todos" },
                    { valor: "ACEITE", label: "Aceites" },
                    { valor: "REJEITADO", label: "Rejeitados" },
                  ] as { valor: SubFiltro; label: string }[]
                ).map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => setSubFiltro(opcao.valor)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      subFiltro === opcao.valor
                        ? opcao.valor === "ACEITE"
                          ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                          : opcao.valor === "REJEITADO"
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
          ) : orcamentosVisiveis.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-ink-muted)]">
              {orcamentos.length === 0 ? (
                <>
                  Ainda não há orçamentos.{" "}
                  <a
                    href="/orcamentos/novo"
                    className="font-medium text-[var(--color-accent)] underline"
                  >
                    Criar o primeiro
                  </a>
                  .
                </>
              ) : verTerminados ? (
                "Sem orçamentos terminados com este filtro."
              ) : (
                "Sem orçamentos para mostrar."
              )}
            </p>
          ) : verTerminados ? (
            <div className="space-y-2 p-4">
              {orcamentosVisiveis.map((orcamento) => (
                <div
                  key={orcamento.id}
                  style={{ backgroundColor: LINHA_BG[orcamento.estado] }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-full px-5 py-3"
                >
                  <button
                    onClick={() => abrirPreview(orcamento)}
                    className="flex flex-1 items-center gap-4 min-w-0 text-left"
                  >
                    <span className="font-medium text-[var(--color-ink)] whitespace-nowrap underline-offset-2 hover:underline">
                      {orcamento.cliente?.nome ?? "—"}
                    </span>
                    <span className="text-sm text-[var(--color-ink-muted)] truncate">
                      {orcamento.linhas.length} item{orcamento.linhas.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="tabular text-sm font-semibold text-[var(--color-ink)]">
                      {formatarPreco(calcularTotal(orcamento.linhas))}
                    </span>
                    <select
                      value={orcamento.estado}
                      disabled={atualizandoId === orcamento.id}
                      onChange={(e) =>
                        handleMudarEstado(
                          orcamento.id,
                          e.target.value as EstadoOrcamento
                        )
                      }
                      className={`cursor-pointer rounded-full border-0 bg-white/60 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] ${atualizandoId === orcamento.id ? "opacity-50" : ""}`}
                    >
                      {Object.entries(ESTADO_LABEL).map(([valor, label]) => (
                        <option key={valor} value={valor}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleApagar(orcamento)}
                      disabled={apagandoId === orcamento.id}
                      className="rounded-full bg-white/60 px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-danger)] disabled:opacity-50"
                    >
                      Apagar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Itens</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {orcamentosVisiveis.map((orcamento) => (
                  <tr
                    key={orcamento.id}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-[var(--color-ink)]">
                      <button
                        onClick={() => abrirPreview(orcamento)}
                        className="underline-offset-2 hover:underline"
                      >
                        {orcamento.cliente?.nome ?? "—"}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                      {orcamento.linhas.length} item{orcamento.linhas.length !== 1 ? "s" : ""}
                    </td>
                    <td className="tabular px-5 py-3 font-medium text-[var(--color-ink)]">
                      {formatarPreco(calcularTotal(orcamento.linhas))}
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
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirPreview(orcamento)}
                          className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                          Ver
                        </button>
                        <a
                          href={`/orcamentos/${orcamento.id}/editar`}
                          className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                          Editar
                        </a>
                        <button
                          onClick={() => handleEnviarEmail(orcamento)}
                          disabled={enviandoId === orcamento.id}
                          className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
                        >
                          {enviandoId === orcamento.id
                            ? "A enviar..."
                            : "Enviar por email"}
                        </button>
                        <button
                          onClick={() => handleApagar(orcamento)}
                          disabled={apagandoId === orcamento.id}
                          className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
                        >
                          {apagandoId === orcamento.id ? "A apagar..." : "Apagar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      {preview && (
        <div
          onClick={fecharPreview}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-ink)]">
                  {preview.cliente?.nome ?? "—"}
                </h2>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_COR[preview.estado]}`}
                >
                  {ESTADO_LABEL[preview.estado]}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/orcamentos/${preview.id}/editar`}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Editar
                </a>
                <button
                  onClick={() => handleCopiarLink(preview)}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Copiar link
                </button>
                <button
                  onClick={() => {
                    handleEnviarEmail(preview);
                    fecharPreview();
                  }}
                  disabled={enviandoId === preview.id}
                  className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                >
                  {enviandoId === preview.id ? "A enviar..." : "Enviar por email"}
                </button>
                <button
                  onClick={() => {
                    const orcamento = preview;
                    fecharPreview();
                    handleApagar(orcamento);
                  }}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
                >
                  Apagar
                </button>
                <button
                  onClick={fecharPreview}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  ✕
                </button>
              </div>
            </div>

            {previewLoading || !previewUrl ? (
              <div className="flex flex-1 items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-ink-muted)]">
                A gerar pré-visualização...
              </div>
            ) : (
              <div className="flex-1 overflow-hidden bg-[var(--color-bg)]">
                <PdfViewer url={previewUrl} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
