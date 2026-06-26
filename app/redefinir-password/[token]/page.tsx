"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export default function RedefinirPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (password.length < 8) {
      setErro("A password tem de ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setErro("As passwords não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao redefinir a password");
      }

      setSucesso(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Erro ao redefinir a password"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          Definir nova password
        </h1>

        {sucesso ? (
          <p className="mt-4 text-sm font-medium text-[var(--color-success)]">
            Password redefinida com sucesso! A redirecionar para o login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                Nova password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                Confirmar password
              </label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className={inputClass}
                placeholder="Repete a password"
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
              {submitting ? "A guardar..." : "Redefinir password"}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm font-medium text-[var(--color-ink-muted)] hover:underline"
            >
              Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}