/*
  Warnings:

  - Added the required column `empresaId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Orcamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Trabalho` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trabalho" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilizador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "Utilizador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_nif_key" ON "Empresa"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_email_key" ON "Utilizador"("email");

-- CreateIndex
CREATE INDEX "Cliente_empresaId_idx" ON "Cliente"("empresaId");

-- CreateIndex
CREATE INDEX "Orcamento_empresaId_idx" ON "Orcamento"("empresaId");

-- CreateIndex
CREATE INDEX "Trabalho_empresaId_idx" ON "Trabalho"("empresaId");

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabalho" ADD CONSTRAINT "Trabalho_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
