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
    const { nome, telefone, email, morada } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "O nome é obrigatório" },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: { nome, telefone, email, morada, empresaId },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
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
    const clientes = await prisma.cliente.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clientes);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}