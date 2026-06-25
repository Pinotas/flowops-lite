import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const DIAS_LEMBRETE_ORCAMENTO_PENDENTE = 7;

function formatarData(data: Date) {
  return data.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function notificarTrabalhosDeAmanha() {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(0, 0, 0, 0);

  const fimDeAmanha = new Date(amanha);
  fimDeAmanha.setHours(23, 59, 59, 999);

  const trabalhos = await prisma.trabalho.findMany({
    where: {
      data: { gte: amanha, lte: fimDeAmanha },
      estado: "AGENDADO",
      lembreteEnviado: false,
    },
    include: { cliente: true, empresa: true },
  });

  let enviados = 0;
  for (const trabalho of trabalhos) {
    if (trabalho.cliente.email) {
      const { error } = await resend.emails.send({
        from: "FlowOps <orcamentos@flowops.website>",
        to: trabalho.cliente.email,
        subject: `Lembrete: trabalho agendado para amanhã com ${trabalho.empresa.nome}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #1c1917;">Olá ${trabalho.cliente.nome},</h2>
            <p style="color: #57534e;">
              Para te lembrar que tens um trabalho agendado com
              <strong>${trabalho.empresa.nome}</strong> no dia
              <strong>${formatarData(trabalho.data)}</strong>.
            </p>
            ${trabalho.notas ? `<p style="color: #57534e;">Notas: ${trabalho.notas}</p>` : ""}
          </div>
        `,
      });
      if (error) {
        console.error("Erro ao enviar lembrete de trabalho:", error);
        continue;
      }
    }

    await prisma.trabalho.update({
      where: { id: trabalho.id },
      data: { lembreteEnviado: true },
    });
    enviados++;
  }

  return enviados;
}

async function notificarOrcamentosPendentes() {
  const limite = new Date();
  limite.setDate(limite.getDate() - DIAS_LEMBRETE_ORCAMENTO_PENDENTE);

  const orcamentos = await prisma.orcamento.findMany({
    where: {
      estado: { in: ["PENDENTE", "ENVIADO"] },
      createdAt: { lte: limite },
      lembreteEnviado: false,
    },
    include: {
      cliente: true,
      empresa: { include: { utilizadores: true } },
    },
  });

  let enviados = 0;
  for (const orcamento of orcamentos) {
    const destinatario = orcamento.empresa.utilizadores[0]?.email;
    if (destinatario) {
      const { error } = await resend.emails.send({
        from: "FlowOps <orcamentos@flowops.website>",
        to: destinatario,
        subject: `Orçamento pendente há mais de ${DIAS_LEMBRETE_ORCAMENTO_PENDENTE} dias`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #1c1917;">Orçamento ainda sem resposta</h2>
            <p style="color: #57534e;">
              O orçamento para <strong>${orcamento.cliente.nome}</strong>,
              criado em ${formatarData(orcamento.createdAt)}, continua
              sem resposta. Pode ser uma boa altura para fazer um
              seguimento.
            </p>
          </div>
        `,
      });
      if (error) {
        console.error("Erro ao enviar lembrete de orçamento pendente:", error);
        continue;
      }
    }

    await prisma.orcamento.update({
      where: { id: orcamento.id },
      data: { lembreteEnviado: true },
    });
    enviados++;
  }

  return enviados;
}

export async function GET(request: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  if (segredo) {
    const autorizacao = request.headers.get("authorization");
    if (autorizacao !== `Bearer ${segredo}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  const trabalhosNotificados = await notificarTrabalhosDeAmanha();
  const orcamentosNotificados = await notificarOrcamentosPendentes();

  return NextResponse.json({
    ok: true,
    trabalhosNotificados,
    orcamentosNotificados,
  });
}
