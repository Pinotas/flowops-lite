import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "O email é obrigatório" },
        { status: 400 }
      );
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { email },
    });

    // Por segurança, respondemos sempre com sucesso, mesmo que o email
    // não exista — assim não revelamos que emails estão registados.
    if (!utilizador) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiraEm = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

    await prisma.tokenRecuperacao.create({
      data: {
        token,
        expiraEm,
        utilizadorId: utilizador.id,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${baseUrl}/redefinir-password/${token}`;

    await resend.emails.send({
      from: "FlowOps <orcamentos@flowops.website>",
      to: email,
      subject: "Recuperação de password — FlowOps",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Recuperar password</h2>
          <p style="color: #334155;">
            Recebemos um pedido para repor a password da tua conta FlowOps.
            Se não foste tu, podes ignorar este email.
          </p>
          <p style="margin: 24px 0;">
            <a href="${link}" style="background: #0f172a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Definir nova password
            </a>
          </p>
          <p style="color: #94a3b8; font-size: 13px;">
            Este link expira em 30 minutos. Se o botão não funcionar, copia este link:<br/>
            ${link}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao processar o pedido" },
      { status: 500 }
    );
  }
}