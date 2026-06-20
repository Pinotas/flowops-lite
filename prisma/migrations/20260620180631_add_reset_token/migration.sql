-- CreateTable
CREATE TABLE "TokenRecuperacao" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilizadorId" TEXT NOT NULL,

    CONSTRAINT "TokenRecuperacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenRecuperacao_token_key" ON "TokenRecuperacao"("token");

-- CreateIndex
CREATE INDEX "TokenRecuperacao_token_idx" ON "TokenRecuperacao"("token");

-- AddForeignKey
ALTER TABLE "TokenRecuperacao" ADD CONSTRAINT "TokenRecuperacao_utilizadorId_fkey" FOREIGN KEY ("utilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
