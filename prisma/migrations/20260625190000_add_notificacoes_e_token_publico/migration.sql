-- AlterTable: adiciona colunas como opcionais primeiro
ALTER TABLE "Orcamento" ADD COLUMN "tokenPublico" TEXT;
ALTER TABLE "Orcamento" ADD COLUMN "lembreteEnviado" BOOLEAN NOT NULL DEFAULT false;

-- Popula tokenPublico para linhas existentes com um valor único
UPDATE "Orcamento" SET "tokenPublico" = md5(random()::text || clock_timestamp()::text || id) WHERE "tokenPublico" IS NULL;

-- Agora torna a coluna obrigatória
ALTER TABLE "Orcamento" ALTER COLUMN "tokenPublico" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_tokenPublico_key" ON "Orcamento"("tokenPublico");
CREATE INDEX "Orcamento_tokenPublico_idx" ON "Orcamento"("tokenPublico");

-- AlterTable
ALTER TABLE "Trabalho" ADD COLUMN "lembreteEnviado" BOOLEAN NOT NULL DEFAULT false;
