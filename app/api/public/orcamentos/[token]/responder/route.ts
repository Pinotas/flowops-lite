import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const RESPOSTAS_VALIDAS = ["ACEITE", "REJEITADO"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const body = await request.json();
    const { resposta } = body;

    if (!RESPOSTAS_VALIDAS.includes(resposta)) {
      return NextResponse.json(
        { error: "Resposta inválida" },
        { status: 400 }
      );
    }

    const orcamento = await prisma.orcamento.findUnique({
      where: { tokenPublico: token },
      include: {
        cliente: true,
        empresa: { include: { utilizadores: true } },
      },
    });

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    if (orcamento.estado === "ACEITE" || orcamento.estado === "REJEITADO") {
      return NextResponse.json(
        { error: "Este orçamento já tem uma resposta registada." },
        { status: 409 }
      );
    }

    const atualizado = await prisma.orcamento.update({
      where: { id: orcamento.id },
      data: { estado: resposta },
    });

    const destinatarios = orcamento.empresa.utilizadores
      .map((u) => u.email)
      .filter(Boolean);

    if (destinatarios.length > 0) {
      const aceite = resposta === "ACEITE";
      const { error: emailError } = await resend.emails.send({
        from: "FlowOps <orcamentos@flowops.website>",
        to: destinatarios,
        subject: aceite
          ? `${orcamento.cliente.nome} aceitou o orçamento`
          : `${orcamento.cliente.nome} rejeitou o orçamento`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #1c1917;">
              ${aceite ? "Orçamento aceite ✅" : "Orçamento rejeitado"}
            </h2>
            <p style="color: #57534e;">
              <strong>${orcamento.cliente.nome}</strong> ${aceite ? "aceitou" : "rejeitou"}
              o orçamento enviado por ${orcamento.empresa.nome}.
            </p>
          </div>
        `,
      });
      if (emailError) {
        console.error("Erro ao notificar a empresa:", emailError);
      }
    }

    return NextResponse.json({ ok: true, estado: atualizado.estado });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao registar a resposta" },
      { status: 500 }
    );
  }
}
