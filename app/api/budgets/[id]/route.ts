import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const orcamento = await prisma.orcamento.findFirst({
    where: { id, empresaId },
    include: { cliente: true, linhas: { orderBy: { ordem: "asc" } } },
  });

  if (!orcamento) {
    return NextResponse.json(
      { error: "Orçamento não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(orcamento);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, clienteId, linhas } = body;

    const existente = await prisma.orcamento.findFirst({ where: { id, empresaId } });
    if (!existente) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    if (clienteId !== undefined) {
      const cliente = await prisma.cliente.findFirst({
        where: { id: clienteId, empresaId },
      });
      if (!cliente) {
        return NextResponse.json(
          { error: "Cliente inválido" },
          { status: 400 }
        );
      }
    }

    if (linhas !== undefined) {
      if (!Array.isArray(linhas) || linhas.length === 0) {
        return NextResponse.json(
          { error: "É necessária pelo menos uma linha" },
          { status: 400 }
        );
      }
      for (const linha of linhas) {
        if (!linha.descricao || linha.precoUnit == null) {
          return NextResponse.json(
            { error: "Cada linha precisa de descricao e precoUnit" },
            { status: 400 }
          );
        }
        if (Number(linha.precoUnit) <= 0) {
          return NextResponse.json(
            { error: "O preço unitário tem de ser maior que zero" },
            { status: 400 }
          );
        }
        if (linha.quantidade != null && Number(linha.quantidade) <= 0) {
          return NextResponse.json(
            { error: "A quantidade tem de ser maior que zero" },
            { status: 400 }
          );
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      if (linhas !== undefined) {
        await tx.linhaOrcamento.deleteMany({ where: { orcamentoId: id } });
      }
      await tx.orcamento.update({
        where: { id },
        data: {
          ...(estado !== undefined && { estado }),
          ...(clienteId !== undefined && { clienteId }),
          ...(linhas !== undefined && {
            linhas: {
              create: linhas.map(
                (linha: { descricao: string; quantidade?: number; precoUnit: number }, index: number) => ({
                  descricao: linha.descricao,
                  quantidade: linha.quantidade ?? 1,
                  precoUnit: parseFloat(String(linha.precoUnit)),
                  ordem: index,
                })
              ),
            },
          }),
        },
      });
    });

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: { cliente: true, linhas: { orderBy: { ordem: "asc" } } },
    });
    return NextResponse.json(orcamento);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar orçamento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const resultado = await prisma.orcamento.deleteMany({
      where: { id, empresaId },
    });

    if (resultado.count === 0) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao apagar orçamento" },
      { status: 500 }
    );
  }
}