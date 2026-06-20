import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, notas, clienteId, estado } = body;

    if (!data || !clienteId) {
      return NextResponse.json(
        { error: "data e clienteId são obrigatórios" },
        { status: 400 }
      );
    }

    const trabalho = await prisma.trabalho.create({
      data: {
        data: new Date(data),
        notas,
        clienteId,
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
  try {
    const trabalhos = await prisma.trabalho.findMany({
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