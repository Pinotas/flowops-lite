"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lembrarSessao, setLembrarSessao] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSubmitting(true);

    try {
      const resultado = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (resultado?.error) {
        const matchBloqueio = resultado.code?.match(/^conta-bloqueada-(\d+)$/);
        if (resultado.code === "email-nao-existe") {
          setErro("Este email não está registado. Verifica se o escreveste corretamente ou cria uma conta.");
        } else if (matchBloqueio) {
          const minutos = matchBloqueio[1];
          setErro(
            `Demasiadas tentativas falhadas. A conta foi temporariamente bloqueada. Tenta novamente dentro de ${minutos} minuto${minutos === "1" ? "" : "s"}.`
          );
        } else {
          setErro("Email ou password incorretos.");
        }
        return;
      }

      await fetch("/api/auth/lembrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lembrar: lembrarSessao }),
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErro("Erro ao entrar. Tenta de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          {t.login.titulo}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {t.login.semConta}{" "}
          <Link href="/registo" className="font-medium text-[var(--color-accent)] hover:underline">
            {t.login.criarConta}
          </Link>
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
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
            <input
              type="checkbox"
              checked={lembrarSessao}
              onChange={(e) => setLembrarSessao(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            />
            {t.login.manterSessao}
          </label>

          {erro && (
            <p className="text-xs font-medium text-[var(--color-danger)]">{erro}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {submitting ? t.login.aEntrar : t.login.entrar}
          </button>

          <Link
            href="/recuperar-password"
            className="block text-center text-sm font-medium text-[var(--color-ink-muted)] hover:underline"
          >
            {t.login.esqueciPassword}
          </Link>
        </form>
      </div>
    </div>
  );
}
