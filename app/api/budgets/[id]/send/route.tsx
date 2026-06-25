import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";
import { gerarOrcamentoPdf, numeroOrcamento as gerarNumeroOrcamento } from "@/lib/gerar-orcamento-pdf";

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
      include: {
        cliente: true,
        empresa: true,
        linhas: { orderBy: { ordem: "asc" } },
      },
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

    const numeroOrcamento = gerarNumeroOrcamento(orcamento);
    const pdfBuffer = await gerarOrcamentoPdf(orcamento);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const linkProposta = `${baseUrl}/proposta/${orcamento.tokenPublico}`;

    const { data: emailData, error: emailError } = await resend.emails.send({
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
          <p style="text-align: center; margin: 24px 0;">
            <a href="${linkProposta}" style="background: #3730a3; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Ver e responder ao orçamento
            </a>
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

    // O SDK do Resend pode devolver sucesso HTTP mas um erro dentro do
    // payload (ex: destinatário não permitido em modo de teste). Sem
    // esta verificação, o pedido parece ter sucesso mas o email nunca sai.
    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json(
        { error: emailError.message || "O serviço de email rejeitou o envio" },
        { status: 502 }
      );
    }

    console.log("Email enviado com sucesso, id:", emailData?.id);

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