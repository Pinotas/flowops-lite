"use client";

import { useEffect, useRef, useState } from "react";
import { PAISES, encontrarPaisPorCodigo } from "@/lib/paises";

type SeletorPaisProps = {
  codigoPais: string;
  onChange: (codigo: string) => void;
};

export function SeletorPais({ codigoPais, onChange }: SeletorPaisProps) {
  const [aberto, setAberto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const paisSelecionado = encontrarPaisPorCodigo(codigoPais);

  const paisesFiltrados = PAISES.filter((pais) =>
    `${pais.nome} ${pais.indicativo}`
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
        setFiltro("");
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex h-full items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        title={`${paisSelecionado.nome} (${paisSelecionado.indicativo})`}
      >
        <span className="text-base leading-none">{paisSelecionado.bandeira}</span>
        <span className="text-[var(--color-ink-muted)]">{paisSelecionado.indicativo}</span>
      </button>

      {aberto && (
        <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <div className="border-b border-[var(--color-border)] p-2">
            <input
              autoFocus
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Pesquisar país..."
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {paisesFiltrados.length === 0 ? (
              <p className="px-3 py-2 text-sm text-[var(--color-ink-muted)]">
                Nenhum país encontrado.
              </p>
            ) : (
              paisesFiltrados.map((pais) => (
                <button
                  key={pais.codigo}
                  type="button"
                  onClick={() => {
                    onChange(pais.codigo);
                    setAberto(false);
                    setFiltro("");
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[var(--color-bg)] ${
                    pais.codigo === codigoPais ? "bg-[var(--color-bg)]" : ""
                  }`}
                >
                  <span className="text-base leading-none">{pais.bandeira}</span>
                  <span className="flex-1 truncate text-[var(--color-ink)]">{pais.nome}</span>
                  <span className="text-[var(--color-ink-faint)]">{pais.indicativo}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
