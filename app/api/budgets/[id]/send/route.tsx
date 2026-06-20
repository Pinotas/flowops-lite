import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";
import { OrcamentoPdf } from "@/components/pdf/OrcamentoPdf";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const orcamento = await prisma.orcamento.findFirst({
      where: { id, empresaId },
      include: { cliente: true, empresa: true },
    });

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    if (!orcamento.cliente.email) {
      return NextResponse.json(
        { error: "Este cliente não tem email registado" },
        { status: 400 }
      );
    }

    const numeroOrcamento = orcamento.id.slice(-8).toUpperCase();
    const dataFormatada = new Date(orcamento.createdAt).toLocaleDateString(
      "pt-PT",
      { day: "2-digit", month: "2-digit", year: "numeric" }
    );

    const pdfBuffer = await renderToBuffer(
      <OrcamentoPdf
        empresaNome={orcamento.empresa.nome}
        empresaNif={orcamento.empresa.nif}
        clienteNome={orcamento.cliente.nome}
        clienteEmail={orcamento.cliente.email}
        clienteTelefone={orcamento.cliente.telefone}
        clienteMorada={orcamento.cliente.morada}
        descricao={orcamento.descricao}
        preco={orcamento.preco}
        numeroOrcamento={numeroOrcamento}
        data={dataFormatada}
      />
    );

    await resend.emails.send({
      from: "FlowOps <orcamentos@flowops.website>",
      to: orcamento.cliente.email,
      subject: `Orçamento de ${orcamento.empresa.nome}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1c1917;">Olá ${orcamento.cliente.nome},</h2>
          <p style="color: #57534e;">
            Segue em anexo o orçamento solicitado, da parte de
            <strong>${orcamento.empresa.nome}</strong>.
          </p>
          <p style="color: #57534e;">
            Qualquer questão, estamos disponíveis para ajudar.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `orcamento-${numeroOrcamento}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    // Atualiza o estado para "ENVIADO" se ainda estava pendente
    if (orcamento.estado === "PENDENTE") {
      await prisma.orcamento.update({
        where: { id },
        data: { estado: "ENVIADO" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao enviar o orçamento" },
      { status: 500 }
    );
  }
}