import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";

export async function GET() {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { id: true, nome: true, nif: true, morada: true, logoUrl: true },
    });

    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(empresa);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao carregar empresa" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nome, morada } = body;

    const empresa = await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        ...(nome && { nome }),
        ...(morada !== undefined && { morada }),
      },
      select: { id: true, nome: true, nif: true, morada: true, logoUrl: true },
    });

    return NextResponse.json(empresa);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar empresa" },
      { status: 500 }
    );
  }
}