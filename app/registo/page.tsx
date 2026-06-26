"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { validarNif } from "@/lib/validacoes";
import { useLocale } from "@/components/LocaleProvider";

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export default function RegistoPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [nif, setNif] = useState("");
  const [morada, setMorada] = useState("");
  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErro("A imagem não pode exceder 2MB.");
      return;
    }

    setErro(null);
    setLogo(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!validarNif(nif)) {
      setErro("O NIF indicado não é válido.");
      return;
    }

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
          morada: morada || null,
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

      // Com sessão já criada, envia o logotipo se foi escolhido um
      if (logo) {
        const formData = new FormData();
        formData.append("logo", logo);
        await fetch("/api/upload-logo", { method: "POST", body: formData });
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
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          {t.registo.titulo}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {t.registo.jaTensConta}{" "}
          <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            {t.registo.entrar}
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
              {logoPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreviewUrl}
                  alt="Pré-visualização do logotipo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs text-[var(--color-ink-faint)]">Logo</span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg)]"
              >
                {logo ? "Trocar logotipo" : "Adicionar logotipo (opcional)"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                PNG, JPEG ou WEBP. Máximo 2MB.
              </p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
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
            <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
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
            <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
              Morada (opcional)
            </label>
            <input
              type="text"
              value={morada}
              onChange={(e) => setMorada(e.target.value)}
              className={inputClass}
              placeholder="Rua, número, código postal, cidade"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
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
              placeholder="Mínimo 8 caracteres"
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
            {submitting ? t.registo.aCriar : t.registo.criarConta}
          </button>
        </form>
      </div>
    </div>
  );
}
