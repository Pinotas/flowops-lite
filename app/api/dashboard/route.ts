import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const fimHoje = new Date();
    fimHoje.setHours(23, 59, 59, 999);

    const [clientesNovos, orcamentosPendentes, trabalhosHoje] =
      await Promise.all([
        prisma.cliente.findMany({
          where: { estado: "NOVO" },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.orcamento.findMany({
          where: { estado: "PENDENTE" },
          include: { cliente: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.trabalho.findMany({
          where: {
            data: { gte: inicioHoje, lte: fimHoje },
          },
          include: { cliente: true },
          orderBy: { data: "asc" },
        }),
      ]);

    const [totalClientes, totalOrcamentosPendentes, totalTrabalhosHoje] =
      await Promise.all([
        prisma.cliente.count(),
        prisma.orcamento.count({ where: { estado: "PENDENTE" } }),
        prisma.trabalho.count({
          where: { data: { gte: inicioHoje, lte: fimHoje } },
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