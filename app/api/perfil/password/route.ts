import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/api-auth";

export async function PATCH(request: NextRequest) {
  const sessao = await getSessaoAtual();
  if (!sessao) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { passwordAtual, passwordNova } = body;

    if (!passwordAtual || !passwordNova) {
      return NextResponse.json(
        { error: "passwordAtual e passwordNova são obrigatórias" },
        { status: 400 }
      );
    }

    if (passwordNova.length < 8) {
      return NextResponse.json(
        { error: "A nova password tem de ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { id: sessao.utilizadorId },
    });
    if (!utilizador) {
      return NextResponse.json(
        { error: "Utilizador não encontrado" },
        { status: 404 }
      );
    }

    const passwordValida = await bcrypt.compare(passwordAtual, utilizador.password);
    if (!passwordValida) {
      return NextResponse.json(
        { error: "A password atual está incorreta" },
        { status: 400 }
      );
    }

    const novaHash = await bcrypt.hash(passwordNova, 10);
    await prisma.utilizador.update({
      where: { id: sessao.utilizadorId },
      data: { password: novaHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao mudar a password" },
      { status: 500 }
    );
  }
}
