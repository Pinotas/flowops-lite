"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Recuperar password
        </h1>

        {enviado ? (
          <div className="mt-6">
            <p className="text-sm text-slate-600">
              Se existir uma conta com o email <strong>{email}</strong>,
              vais receber um link para definir uma nova password. Verifica
              a tua caixa de entrada (e o spam).
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-slate-900 underline"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">
              Indica o teu email e enviamos-te um link para definir uma
              nova password.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
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
                <p className="text-xs font-medium text-red-600">{erro}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {submitting ? "A enviar..." : "Enviar link"}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-slate-500 underline"
            >
              Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}