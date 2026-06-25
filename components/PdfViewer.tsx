"use client";

import { useEffect, useRef, useState } from "react";

type PdfViewerProps = {
  url: string;
};

export function PdfViewer({ url }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function renderizar() {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      try {
        const pdf = await pdfjsLib.getDocument({ url }).promise;
        if (cancelado || !containerRef.current) return;

        containerRef.current.innerHTML = "";

        for (let numeroPagina = 1; numeroPagina <= pdf.numPages; numeroPagina++) {
          const pagina = await pdf.getPage(numeroPagina);
          const viewport = pagina.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mb-4 w-full max-w-full rounded-lg shadow-sm";

          const contexto = canvas.getContext("2d");
          if (!contexto) continue;

          await pagina.render({ canvasContext: contexto, viewport, canvas }).promise;

          if (cancelado || !containerRef.current) return;
          containerRef.current.appendChild(canvas);
        }
      } catch {
        if (!cancelado) setErro("Não foi possível renderizar o PDF.");
      }
    }

    renderizar();

    return () => {
      cancelado = true;
    };
  }, [url]);

  if (erro) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--color-danger)]">
        {erro}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center overflow-y-auto p-4"
    />
  );
}
