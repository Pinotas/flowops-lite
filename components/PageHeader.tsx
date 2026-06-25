export default function PageHeader({
  titulo,
  subtitulo,
  icone,
  corIcone,
  acoes,
}: {
  titulo: string;
  subtitulo?: string;
  icone: React.ReactNode;
  corIcone: string;
  acoes?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${corIcone}1a`, color: corIcone }}
        >
          {icone}
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {titulo}
          </h1>
          {subtitulo && (
            <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{subtitulo}</p>
          )}
        </div>
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </header>
  );
}
