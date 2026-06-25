/*
  Warnings:

  - You are about to drop the column `descricao` on the `Orcamento` table. All the data in the column will be lost.
  - You are about to drop the column `preco` on the `Orcamento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orcamento" DROP COLUMN "descricao",
DROP COLUMN "preco";

-- CreateTable
CREATE TABLE "LinhaOrcamento" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "precoUnit" DOUBLE PRECISION NOT NULL,
    "ordem" INTEGER NOT NULL,
    "orcamentoId" TEXT NOT NULL,

    CONSTRAINT "LinhaOrcamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinhaOrcamento_orcamentoId_idx" ON "LinhaOrcamento"("orcamentoId");

-- AddForeignKey
ALTER TABLE "LinhaOrcamento" ADD CONSTRAINT "LinhaOrcamento_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "Orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
