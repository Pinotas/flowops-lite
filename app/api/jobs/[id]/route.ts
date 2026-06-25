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
    const { estado, data, notas, clienteId } = body;

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

    const dadosAtualizar: Record<string, unknown> = {};
    if (estado !== undefined) dadosAtualizar.estado = estado;
    if (data !== undefined) dadosAtualizar.data = new Date(data);
    if (notas !== undefined) dadosAtualizar.notas = notas;
    if (clienteId !== undefined) dadosAtualizar.clienteId = clienteId;

    if (Object.keys(dadosAtualizar).length === 0) {
      return NextResponse.json(
        { error: "Nada para atualizar" },
        { status: 400 }
      );
    }

    // updateMany garante que só atualiza se o trabalho pertencer a esta empresa
    const resultado = await prisma.trabalho.updateMany({
      where: { id, empresaId },
      data: dadosAtualizar,
    });

    if (resultado.count === 0) {
      return NextResponse.json(
        { error: "Trabalho não encontrado" },
        { status: 404 }
      );
    }

    const trabalho = await prisma.trabalho.findUnique({
      where: { id },
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
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const resultado = await prisma.trabalho.deleteMany({
      where: { id, empresaId },
    });

    if (resultado.count === 0) {
      return NextResponse.json(
        { error: "Trabalho não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao apagar trabalho" },
      { status: 500 }
    );
  }
}
