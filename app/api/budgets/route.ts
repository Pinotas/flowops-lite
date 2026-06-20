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
    const { descricao, preco, clienteId, estado } = body;

    if (!descricao || !preco || !clienteId) {
      return NextResponse.json(
        { error: "descricao, preco e clienteId são obrigatórios" },
        { status: 400 }
      );
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
        descricao,
        preco: parseFloat(preco),
        clienteId,
        empresaId,
        ...(estado && { estado }),
      },
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
      include: { cliente: true },
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