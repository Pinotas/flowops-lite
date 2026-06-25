"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export default function MudarPasswordPage() {
  const router = useRouter();
  const [passwordAtual, setPasswordAtual] = useState("");
  const [passwordNova, setPasswordNova] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [alterandoPassword, setAlterandoPassword] = useState(false);
  const [erroPassword, setErroPassword] = useState<string | null>(null);
  const [avisoPassword, setAvisoPassword] = useState<string | null>(null);

  async function handleMudarPassword(e: React.FormEvent) {
    e.preventDefault();
    setErroPassword(null);
    setAvisoPassword(null);

    if (!passwordAtual || !passwordNova) {
      setErroPassword("Preenche a password atual e a nova.");
      return;
    }
    if (passwordNova.length < 8) {
      setErroPassword("A nova password tem de ter pelo menos 8 caracteres.");
      return;
    }
    if (passwordNova !== passwordConfirmar) {
      setErroPassword("As passwords novas não coincidem.");
      return;
    }

    setAlterandoPassword(true);
    try {
      const res = await fetch("/api/perfil/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordAtual, passwordNova }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao mudar a password");

      setAvisoPassword("Password atualizada com sucesso.");
      setPasswordAtual("");
      setPasswordNova("");
      setPasswordConfirmar("");
    } catch (err) {
      setErroPassword(err instanceof Error ? err.message : "Erro ao mudar a password");
    } finally {
      setAlterandoPassword(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-md px-6 py-10">
        <header className="mb-8">
          <button
            onClick={() => router.push("/perfil")}
            className="text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            ← Voltar ao perfil
          </button>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Mudar password
          </h1>
        </header>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <form onSubmit={handleMudarPassword} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                Password atual
              </label>
              <input
                type="password"
                value={passwordAtual}
                onChange={(e) => setPasswordAtual(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                Nova password
              </label>
              <input
                type="password"
                value={passwordNova}
                onChange={(e) => setPasswordNova(e.target.value)}
                className={inputClass}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                Confirmar nova password
              </label>
              <input
                type="password"
                value={passwordConfirmar}
                onChange={(e) => setPasswordConfirmar(e.target.value)}
                className={inputClass}
                placeholder="Repete a nova password"
              />
            </div>

            {erroPassword && (
              <p className="text-xs font-medium text-[var(--color-danger)]">{erroPassword}</p>
            )}
            {avisoPassword && (
              <p className="text-xs font-medium text-[var(--color-success)]">{avisoPassword}</p>
            )}

            <button
              type="submit"
              disabled={alterandoPassword}
              className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {alterandoPassword ? "A guardar..." : "Mudar password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
