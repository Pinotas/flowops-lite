import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/api-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessao = await getSessaoAtual();
  if (!sessao) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  if (id === sessao.utilizadorId) {
    return NextResponse.json(
      { error: "Não podes remover a tua própria conta aqui." },
      { status: 400 }
    );
  }

  const totalUtilizadores = await prisma.utilizador.count({
    where: { empresaId: sessao.empresaId },
  });
  if (totalUtilizadores <= 1) {
    return NextResponse.json(
      { error: "Não é possível remover o único utilizador da empresa." },
      { status: 400 }
    );
  }

  const resultado = await prisma.utilizador.deleteMany({
    where: { id, empresaId: sessao.empresaId },
  });

  if (resultado.count === 0) {
    return NextResponse.json(
      { error: "Utilizador não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
