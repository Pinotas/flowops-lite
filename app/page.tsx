"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        if (resultado.code === "email-nao-existe") {
          setErro("Este email não está registado. Verifica se o escreveste corretamente ou cria uma conta.");
        } else {
          setErro("Email ou password incorretos.");
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErro("Erro ao entrar. Tenta de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ainda não tens conta?{" "}
          <Link href="/registo" className="font-medium text-slate-900 underline">
            Criar conta
          </Link>
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
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
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

          {erro && (
            <p className="text-xs font-medium text-red-600">{erro}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? "A entrar..." : "Entrar"}
          </button>

          <Link
            href="/recuperar-password"
            className="block text-center text-sm font-medium text-slate-500 underline"
          >
            Esqueci-me da password
          </Link>
        </form>
      </div>
    </div>
  );
}