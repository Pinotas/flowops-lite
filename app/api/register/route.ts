import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nomeEmpresa, nif, nomeUtilizador, email, password } = body;

    if (!nomeEmpresa || !nif || !nomeUtilizador || !email || !password) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A password tem de ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Verifica se já existe empresa com este NIF
    const empresaExistente = await prisma.empresa.findUnique({
      where: { nif },
    });
    if (empresaExistente) {
      return NextResponse.json(
        { error: "Já existe uma empresa registada com este NIF" },
        { status: 409 }
      );
    }

    // Verifica se já existe utilizador com este email
    const utilizadorExistente = await prisma.utilizador.findUnique({
      where: { email },
    });
    if (utilizadorExistente) {
      return NextResponse.json(
        { error: "Já existe uma conta com este email" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Cria a empresa e o utilizador associado numa única transação
    const resultado = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: { nome: nomeEmpresa, nif },
      });

      const utilizador = await tx.utilizador.create({
        data: {
          nome: nomeUtilizador,
          email,
          password: passwordHash,
          empresaId: empresa.id,
        },
      });

      return { empresa, utilizador };
    });

    return NextResponse.json(
      {
        ok: true,
        empresaId: resultado.empresa.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar conta" },
      { status: 500 }
    );
  }
}