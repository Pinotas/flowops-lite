import "dotenv/config";
import { prisma } from "./prisma";

async function main() {
  const cliente = await prisma.cliente.create({
    data: {
      nome: "Cliente Teste",
      telefone: "912345678",
    },
  });
  console.log("Cliente criado:", cliente);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());