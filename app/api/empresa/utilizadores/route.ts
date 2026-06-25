import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";

export async function GET() {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const utilizadores = await prisma.utilizador.findMany({
    where: { empresaId },
    select: { id: true, nome: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(utilizadores);
}

export async function POST(request: NextRequest) {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nome, email, password } = body;

    if (!nome || !email || !password) {
      return NextResponse.json(
        { error: "nome, email e password são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A password tem de ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    const existente = await prisma.utilizador.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json(
        { error: "Já existe uma conta com este email" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const utilizador = await prisma.utilizador.create({
      data: { nome, email, password: passwordHash, empresaId },
      select: { id: true, nome: true, email: true, createdAt: true },
    });

    return NextResponse.json(utilizador, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao convidar utilizador" },
      { status: 500 }
    );
  }
}
