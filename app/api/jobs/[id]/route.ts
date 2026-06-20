import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const trabalho = await prisma.trabalho.update({
      where: { id },
      data: { estado },
      include: { cliente: true },
    });

    return NextResponse.json(trabalho);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar trabalho" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.trabalho.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao apagar trabalho" },
      { status: 500 }
    );
  }
}