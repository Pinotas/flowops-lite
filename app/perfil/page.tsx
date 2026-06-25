"use client";

import { useEffect, useState, useRef } from "react";

type Empresa = {
  id: string;
  nome: string;
  nif: string;
  morada: string | null;
  logoUrl: string | null;
};

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export default function PerfilPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [salvandoMorada, setSalvandoMorada] = useState(false);
  const [morada, setMorada] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function carregarEmpresa() {
    try {
      const res = await fetch("/api/empresa");
      const data = await res.json();
      setEmpresa(data);
      setMorada(data.morada || "");
    } catch {
      setErro("Não foi possível carregar os dados da empresa.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarEmpresa();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErro(null);
    setAviso(null);

    if (file.size > 2 * 1024 * 1024) {
      setErro("A imagem não pode exceder 2MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch("/api/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar o logotipo");
      }

      setEmpresa((prev) => (prev ? { ...prev, logoUrl: data.logoUrl } : prev));
      setAviso("Logotipo atualizado com sucesso.");
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Erro ao enviar o logotipo"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleGuardarMorada(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setSalvandoMorada(true);

    try {
      const res = await fetch("/api/empresa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ morada: morada || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao guardar a morada");
      }

      setEmpresa(data);
      setAviso("Morada atualizada com sucesso.");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao guardar a morada");
    } finally {
      setSalvandoMorada(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Perfil da empresa
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Estes dados são usados nos PDFs de orçamentos enviados aos
            clientes.
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-[var(--color-ink-muted)]">A carregar...</p>
        ) : empresa ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                {empresa.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={empresa.logoUrl}
                    alt="Logotipo da empresa"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[var(--color-ink-faint)]">
                    {empresa.nome.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
                >
                  {uploading ? "A enviar..." : "Alterar logotipo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
                  PNG, JPEG ou WEBP. Máximo 2MB.
                </p>
              </div>
            </div>

            {erro && (
              <p className="mt-4 text-sm font-medium text-[var(--color-danger)]">
                {erro}
              </p>
            )}
            {aviso && (
              <p className="mt-4 text-sm font-medium text-[var(--color-success)]">
                {aviso}
              </p>
            )}

            <div className="mt-6 border-t border-[var(--color-border)] pt-6">
              <div className="mb-4">
                <p className="text-xs font-medium text-[var(--color-ink-muted)]">
                  Nome da empresa
                </p>
                <p className="text-sm text-[var(--color-ink)]">
                  {empresa.nome}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs font-medium text-[var(--color-ink-muted)]">
                  NIF
                </p>
                <p className="text-sm text-[var(--color-ink)]">
                  {empresa.nif}
                </p>
              </div>

              <form onSubmit={handleGuardarMorada}>
                <label className="mb-1 block text-xs font-medium text-[var(--color-ink-muted)]">
                  Morada
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={morada}
                    onChange={(e) => setMorada(e.target.value)}
                    className={inputClass}
                    placeholder="Rua, número, código postal, cidade"
                  />
                  <button
                    type="submit"
                    disabled={salvandoMorada}
                    className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                  >
                    {salvandoMorada ? "A guardar..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-[var(--color-danger)]">
            {erro}
          </p>
        )}
      </div>
    </div>
  );
}