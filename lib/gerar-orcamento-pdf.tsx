import { renderToBuffer } from "@react-pdf/renderer";
import { OrcamentoPdf } from "@/components/pdf/OrcamentoPdf";
import type { Empresa, Cliente, Orcamento, LinhaOrcamento } from "@/generated/prisma/client";

type OrcamentoCompleto = Orcamento & {
  empresa: Empresa;
  cliente: Cliente;
  linhas: LinhaOrcamento[];
};

export function numeroOrcamento(orcamento: Orcamento) {
  return orcamento.id.slice(-8).toUpperCase();
}

export async function gerarOrcamentoPdf(orcamento: OrcamentoCompleto) {
  const dataFormatada = new Date(orcamento.createdAt).toLocaleDateString(
    "pt-PT",
    { day: "2-digit", month: "2-digit", year: "numeric" }
  );

  return renderToBuffer(
    <OrcamentoPdf
      empresaNome={orcamento.empresa.nome}
      empresaNif={orcamento.empresa.nif}
      empresaMorada={orcamento.empresa.morada}
      empresaLogoUrl={orcamento.empresa.logoUrl}
      clienteNome={orcamento.cliente.nome}
      clienteEmail={orcamento.cliente.email}
      clienteTelefone={orcamento.cliente.telefone}
      clienteMorada={orcamento.cliente.morada}
      linhas={orcamento.linhas}
      numeroOrcamento={numeroOrcamento(orcamento)}
      data={dataFormatada}
    />
  );
}
