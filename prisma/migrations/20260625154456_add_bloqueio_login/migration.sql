-- AlterTable
ALTER TABLE "Utilizador" ADD COLUMN     "bloqueadoAte" TIMESTAMP(3),
ADD COLUMN     "tentativasFalhadas" INTEGER NOT NULL DEFAULT 0;
