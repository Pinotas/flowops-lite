"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar o pedido");
      }

      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar o pedido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          Recuperar password
        </h1>

        {enviado ? (
          <div className="mt-6">
            <p className="text-sm text-[var(--color-ink-muted)]">
              Se existir uma conta com o email <strong>{email}</strong>,
              vais receber um link para definir uma nova password. Verifica
              a tua caixa de entrada (e o spam).
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Indica o teu email e enviamos-te um link para definir uma
              nova password.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="email@empresa.com"
                  required
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
                {submitting ? "A enviar..." : "Enviar link"}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-[var(--color-ink-muted)] hover:underline"
            >
              Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}