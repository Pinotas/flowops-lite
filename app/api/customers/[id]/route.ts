import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
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
    const { estado, nome, telefone, email, morada } = body;

    if (nome !== undefined && !nome.trim()) {
      return NextResponse.json(
        { error: "O nome não pode ficar vazio" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (estado !== undefined) data.estado = estado;
    if (nome !== undefined) data.nome = nome;
    if (telefone !== undefined) data.telefone = telefone;
    if (email !== undefined) data.email = email;
    if (morada !== undefined) data.morada = morada;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nada para atualizar" },
        { status: 400 }
      );
    }

    // updateMany garante que só atualiza se o cliente pertencer a esta empresa
    const resultado = await prisma.cliente.updateMany({
      where: { id, empresaId },
      data,
    });

    if (resultado.count === 0) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const cliente = await prisma.cliente.findUnique({ where: { id } });
    return NextResponse.json(cliente);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
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

    const cliente = await prisma.cliente.findFirst({ where: { id, empresaId } });
    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    await prisma.cliente.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error:
            "Não é possível apagar este cliente porque tem orçamentos ou trabalhos associados. Apaga-os primeiro.",
        },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao apagar cliente" },
      { status: 500 }
    );
  }
}
