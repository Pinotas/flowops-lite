"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

type Empresa = {
  id: string;
  nome: string;
  nif: string;
  morada: string | null;
  logoUrl: string | null;
};

type Utilizador = {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
};

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

export default function PerfilPage() {
  const { data: sessao } = useSession();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [salvandoMorada, setSalvandoMorada] = useState(false);
  const [morada, setMorada] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaPassword, setNovaPassword] = useState("");
  const [convidando, setConvidando] = useState(false);
  const [erroEquipa, setErroEquipa] = useState<string | null>(null);
  const [avisoEquipa, setAvisoEquipa] = useState<string | null>(null);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

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

  async function carregarUtilizadores() {
    try {
      const res = await fetch("/api/empresa/utilizadores");
      const data = await res.json();
      setUtilizadores(data);
    } catch {
      setErroEquipa("Não foi possível carregar a equipa.");
    }
  }

  useEffect(() => {
    carregarEmpresa();
    carregarUtilizadores();
  }, []);

  async function handleConvidar(e: React.FormEvent) {
    e.preventDefault();
    setErroEquipa(null);
    setAvisoEquipa(null);

    if (!novoNome.trim() || !novoEmail.trim() || !novaPassword) {
      setErroEquipa("Nome, email e password são obrigatórios.");
      return;
    }
    if (novaPassword.length < 8) {
      setErroEquipa("A password tem de ter pelo menos 8 caracteres.");
      return;
    }

    setConvidando(true);
    try {
      const res = await fetch("/api/empresa/utilizadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome, email: novoEmail, password: novaPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao convidar utilizador");

      setAvisoEquipa(
        `Conta criada para ${novoEmail}. Partilha o email e a password com essa pessoa.`
      );
      setNovoNome("");
      setNovoEmail("");
      setNovaPassword("");
      await carregarUtilizadores();
    } catch (err) {
      setErroEquipa(err instanceof Error ? err.message : "Erro ao convidar utilizador");
    } finally {
      setConvidando(false);
    }
  }

  async function handleRemoverUtilizador(utilizador: Utilizador) {
    if (!window.confirm(`Remover ${utilizador.nome} (${utilizador.email}) da empresa?`)) {
      return;
    }
    setErroEquipa(null);
    setAvisoEquipa(null);
    setRemovendoId(utilizador.id);
    try {
      const res = await fetch(`/api/empresa/utilizadores/${utilizador.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover utilizador");
      await carregarUtilizadores();
    } catch (err) {
      setErroEquipa(err instanceof Error ? err.message : "Erro ao remover utilizador");
    } finally {
      setRemovendoId(null);
    }
  }

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
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
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

        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="mb-1 text-sm font-semibold text-[var(--color-ink)]">
            Equipa
          </h2>
          <p className="mb-4 text-xs text-[var(--color-ink-muted)]">
            Convida outras pessoas da tua empresa a usar o FlowOps com a mesma conta.
          </p>

          {utilizadores.length > 0 && (
            <ul className="mb-4 divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
              {utilizadores.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{u.nome}</p>
                    <p className="text-xs text-[var(--color-ink-faint)]">{u.email}</p>
                  </div>
                  {sessao?.user?.email !== u.email && (
                    <button
                      onClick={() => handleRemoverUtilizador(u)}
                      disabled={removendoId === u.id}
                      className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
                    >
                      {removendoId === u.id ? "A remover..." : "Remover"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleConvidar} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className={inputClass}
              placeholder="Nome"
            />
            <input
              type="email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              className={inputClass}
              placeholder="Email"
            />
            <input
              type="password"
              value={novaPassword}
              onChange={(e) => setNovaPassword(e.target.value)}
              className={inputClass}
              placeholder="Password (mín. 8 carateres)"
            />
            {erroEquipa && (
              <p className="col-span-3 text-xs font-medium text-[var(--color-danger)]">{erroEquipa}</p>
            )}
            {avisoEquipa && (
              <p className="col-span-3 text-xs font-medium text-[var(--color-success)]">{avisoEquipa}</p>
            )}
            <button
              type="submit"
              disabled={convidando}
              className="col-span-3 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50 sm:col-span-1"
            >
              {convidando ? "A convidar..." : "Convidar"}
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="mb-1 text-sm font-semibold text-[var(--color-ink)]">
            Segurança
          </h2>
          <p className="mb-4 text-xs text-[var(--color-ink-muted)]">
            Muda a password da tua conta.
          </p>
          <a
            href="/perfil/password"
            className="inline-block rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Mudar password
          </a>
        </div>
      </div>
    </div>
  );
}