import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gerarOrcamentoPdf, numeroOrcamento } from "@/lib/gerar-orcamento-pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const orcamento = await prisma.orcamento.findUnique({
    where: { tokenPublico: token },
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
