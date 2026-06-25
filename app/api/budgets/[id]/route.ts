import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";

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
    const { estado } = body;

    if (!estado) {
      return NextResponse.json(
        { error: "estado é obrigatório" },
        { status: 400 }
      );
    }

    const resultado = await prisma.orcamento.updateMany({
      where: { id, empresaId },
      data: { estado },
    });

    if (resultado.count === 0) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

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