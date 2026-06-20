import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { descricao, preco, clienteId, estado } = body;

    if (!descricao || !preco || !clienteId) {
      return NextResponse.json(
        { error: "descricao, preco e clienteId são obrigatórios" },
        { status: 400 }
      );
    }

    const orcamento = await prisma.orcamento.create({
      data: {
        descricao,
        preco: parseFloat(preco),
        clienteId,
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
  try {
    const orcamentos = await prisma.orcamento.findMany({
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