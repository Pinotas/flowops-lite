import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];
const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum ficheiro enviado" },
        { status: 400 }
      );
    }

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Usa PNG, JPEG ou WEBP." },
        { status: 400 }
      );
    }

    if (file.size > TAMANHO_MAXIMO) {
      return NextResponse.json(
        { error: "A imagem não pode exceder 2MB." },
        { status: 400 }
      );
    }

    const extensao = file.name.split(".").pop() || "png";
    const pathname = `logos/${empresaId}.${extensao}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    await prisma.empresa.update({
      where: { id: empresaId },
      data: { logoUrl: blob.url },
    });

    return NextResponse.json({ logoUrl: blob.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao enviar o logotipo" },
      { status: 500 }
    );
  }
}