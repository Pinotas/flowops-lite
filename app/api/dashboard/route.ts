import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmpresaId } from "@/lib/api-auth";

export async function GET() {
  const empresaId = await getEmpresaId();
  if (!empresaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const fimHoje = new Date();
    fimHoje.setHours(23, 59, 59, 999);

    const [clientesNovos, orcamentosPendentes, trabalhosHoje] =
      await Promise.all([
        prisma.cliente.findMany({
          where: { empresaId },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.orcamento.findMany({
          where: { empresaId, estado: "PENDENTE" },
          include: { cliente: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.trabalho.findMany({
          where: {
            empresaId,
            data: { gte: inicioHoje, lte: fimHoje },
          },
          include: { cliente: true },
          orderBy: { data: "asc" },
        }),
      ]);

    const [totalClientes, totalOrcamentosPendentes, totalTrabalhosHoje] =
      await Promise.all([
        prisma.cliente.count({ where: { empresaId } }),
        prisma.orcamento.count({ where: { empresaId, estado: "PENDENTE" } }),
        prisma.trabalho.count({
          where: { empresaId, data: { gte: inicioHoje, lte: fimHoje } },
        }),
      ]);

    return NextResponse.json({
      totais: {
        clientes: totalClientes,
        orcamentosPendentes: totalOrcamentosPendentes,
        trabalhosHoje: totalTrabalhosHoje,
      },
      clientesNovos,
      orcamentosPendentes,
      trabalhosHoje,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao carregar dashboard" },
      { status: 500 }
    );
  }
}