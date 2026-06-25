import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";
import { gerarOrcamentoPdf, numeroOrcamento } from "@/lib/gerar-orcamento-pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const orcamento = await prisma.orcamento.findFirst({
    where: { id, empresaId },
    include: {
      cliente: true,
      empresa: true,
      linhas: { orderBy: { ordem: "asc" } },
    },
  });

  if (!orcamento) {
    return NextResponse.json(
      { error: "Orçamento não encontrado" },
      { status: 404 }
    );
  }

  const pdfBuffer = await gerarOrcamentoPdf(orcamento);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orcamento-${numeroOrcamento(orcamento)}.pdf"`,
    },
  });
}
