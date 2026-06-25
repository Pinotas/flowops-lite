"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PdfViewer } from "@/components/PdfViewer";

type EstadoOrcamento = "PENDENTE" | "ENVIADO" | "ACEITE" | "REJEITADO";

type OrcamentoPublico = {
  id: string;
  estado: EstadoOrcamento;
  cliente: { nome: string };
};

const RESPONDIDOS: EstadoOrcamento[] = ["ACEITE", "REJEITADO"];

export default function PropostaPublicaPage() {
  const params = useParams<{ token: string }>();
  const [orcamento, setOrcamento] = useState<OrcamentoPublico | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function carregar() {
    try {
      const res = await fetch(`/api/public/orcamentos/${params.token}`);
      if (!res.ok) {
        setErro("Este orçamento não foi encontrado ou o link é inválido.");
        return;
      }
      setOrcamento(await res.json());

      const resPdf = await fetch(`/api/public/orcamentos/${params.token}/pdf`);
      if (resPdf.ok) {
        const blob = await resPdf.blob();
        setPdfUrl((urlAnterior) => {
          if (urlAnterior) URL.revokeObjectURL(urlAnterior);
          return URL.createObjectURL(blob);
        });
      }
    } catch {
      setErro("Não foi possível carregar o orçamento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  async function responder(resposta: "ACEITE" | "REJEITADO") {
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/public/orcamentos/${params.token}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resposta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registar a resposta");
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao registar a resposta");
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-ink-muted)]">
        A carregar...
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6 text-center text-sm font-medium text-[var(--color-danger)]">
        {erro || "Orçamento não encontrado."}
      </div>
    );
  }

  const jaRespondido = RESPONDIDOS.includes(orcamento.estado);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
          <h1 className="text-sm font-semibold text-[var(--color-ink)]">
            Orçamento para {orcamento.cliente.nome}
          </h1>
        </div>

        <div className="flex-1 overflow-hidden bg-[var(--color-bg)]">
          {pdfUrl ? (
            <PdfViewer url={pdfUrl} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-ink-muted)]">
              A gerar pré-visualização...
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] px-4 py-3 sm:px-5">
          {erro && (
            <p className="mb-3 text-sm font-medium text-[var(--color-danger)]">{erro}</p>
          )}

          {jaRespondido ? (
            <p
              className={`rounded-lg px-4 py-3 text-center text-sm font-medium ${
                orcamento.estado === "ACEITE"
                  ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                  : "bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
              }`}
            >
              {orcamento.estado === "ACEITE"
                ? "Já aceitaste este orçamento. Obrigado!"
                : "Já rejeitaste este orçamento."}
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => responder("ACEITE")}
                disabled={enviando}
                className="flex-1 rounded-lg bg-[var(--color-success)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                Aceitar orçamento
              </button>
              <button
                onClick={() => responder("REJEITADO")}
                disabled={enviando}
                className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
              >
                Rejeitar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
