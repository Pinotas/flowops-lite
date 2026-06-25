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
    const { data, notas, clienteId, estado } = body;

    if (!data || !clienteId) {
      return NextResponse.json(
        { error: "data e clienteId são obrigatórios" },
        { status: 400 }
      );
    }

    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);
    if (new Date(data) < inicioHoje) {
      return NextResponse.json(
        { error: "A data do trabalho não pode ser no passado" },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, empresaId },
    });
    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente inválido" },
        { status: 400 }
      );
    }

    const trabalho = await prisma.trabalho.create({
      data: {
        data: new Date(data),
        notas,
        clienteId,
        empresaId,
        ...(estado && { estado }),
      },
    });

    return NextResponse.json(trabalho, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar trabalho" },
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
    const trabalhos = await prisma.trabalho.findMany({
      where: { empresaId },
      include: { cliente: true },
      orderBy: { data: "asc" },
    });
    return NextResponse.json(trabalhos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar trabalhos" },
      { status: 500 }
    );
  }
}