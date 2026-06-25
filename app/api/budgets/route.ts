import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { linhas, clienteId, estado } = body;

    if (!clienteId || !Array.isArray(linhas) || linhas.length === 0) {
      return NextResponse.json(
        { error: "clienteId e pelo menos uma linha são obrigatórios" },
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

    // Confirma que o cliente indicado pertence mesmo a esta empresa
    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, empresaId },
    });
    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente inválido" },
        { status: 400 }
      );
    }

    const orcamento = await prisma.orcamento.create({
      data: {
        clienteId,
        empresaId,
        ...(estado && { estado }),
        linhas: {
          create: linhas.map((linha: { descricao: string; quantidade?: number; precoUnit: number }, index: number) => ({
            descricao: linha.descricao,
            quantidade: linha.quantidade ?? 1,
            precoUnit: parseFloat(String(linha.precoUnit)),
            ordem: index,
          })),
        },
      },
      include: { linhas: { orderBy: { ordem: "asc" } } },
    });

    return NextResponse.json(orcamento, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar orçamento" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const orcamentos = await prisma.orcamento.findMany({
      where: { empresaId },
      include: { cliente: true, linhas: { orderBy: { ordem: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orcamentos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar orçamentos" },
      { status: 500 }
    );
  }
}