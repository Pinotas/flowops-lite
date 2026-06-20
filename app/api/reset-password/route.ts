import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e password são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A password tem de ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    const tokenRecuperacao = await prisma.tokenRecuperacao.findUnique({
      where: { token },
      include: { utilizador: true },
    });

    if (!tokenRecuperacao) {
      return NextResponse.json(
        { error: "Link inválido ou já utilizado" },
        { status: 400 }
      );
    }

    if (tokenRecuperacao.usado) {
      return NextResponse.json(
        { error: "Este link já foi utilizado" },
        { status: 400 }
      );
    }

    if (tokenRecuperacao.expiraEm < new Date()) {
      return NextResponse.json(
        { error: "Este link expirou. Pede um novo." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.utilizador.update({
        where: { id: tokenRecuperacao.utilizadorId },
        data: { password: passwordHash },
      }),
      prisma.tokenRecuperacao.update({
        where: { id: tokenRecuperacao.id },
        data: { usado: true },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao redefinir a password" },
      { status: 500 }
    );
  }
}