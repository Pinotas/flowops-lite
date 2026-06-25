import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const orcamento = await prisma.orcamento.findUnique({
    where: { tokenPublico: token },
    include: {
      cliente: { select: { nome: true } },
      empresa: { select: { nome: true, nif: true, morada: true, logoUrl: true } },
      linhas: { orderBy: { ordem: "asc" } },
    },
  });

  if (!orcamento) {
    return NextResponse.json(
      { error: "Orçamento não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: orcamento.id,
    estado: orcamento.estado,
    createdAt: orcamento.createdAt,
    cliente: orcamento.cliente,
    empresa: orcamento.empresa,
    linhas: orcamento.linhas,
  });
}
