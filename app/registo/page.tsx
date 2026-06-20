"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

export default function RegistoPage() {
  const router = useRouter();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [nif, setNif] = useState("");
  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (password.length < 8) {
      setErro("A password tem de ter pelo menos 8 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeEmpresa,
          nif,
          nomeUtilizador,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      // Conta criada, fazer login automaticamente
      const resultado = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (resultado?.error) {
        // Conta criada mas login falhou, manda para o login manual
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Criar conta da empresa
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Já tens conta?{" "}
          <Link href="/login" className="font-medium text-slate-900 underline">
            Entrar
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Nome da empresa
            </label>
            <input
              type="text"
              value={nomeEmpresa}
              onChange={(e) => setNomeEmpresa(e.target.value)}
              className={inputClass}
              placeholder="Ex: Pinturas Andrade Lda"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              NIF
            </label>
            <input
              type="text"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              className={inputClass}
              placeholder="123456789"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              O teu nome
            </label>
            <input
              type="text"
              value={nomeUtilizador}
              onChange={(e) => setNomeUtilizador(e.target.value)}
              className={inputClass}
              placeholder="Ex: André Pinto"
              required
            />
          </div>
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
              placeholder="Mínimo 8 caracteres"
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
            {submitting ? "A criar conta..." : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}