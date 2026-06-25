import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1c1917",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  empresaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    objectFit: "contain",
  },
  empresaNome: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  empresaNif: {
    fontSize: 9,
    color: "#78716c",
    marginTop: 2,
  },
  tituloOrcamento: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  numeroOrcamento: {
    fontSize: 9,
    color: "#78716c",
    textAlign: "right",
    marginTop: 2,
  },
  secao: {
    marginBottom: 24,
  },
  rotulo: {
    fontSize: 9,
    color: "#78716c",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  clienteNome: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  clienteDetalhe: {
    fontSize: 10,
    color: "#57534e",
    marginTop: 2,
  },
  tabela: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
  },
  linhaCabecalho: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
    paddingVertical: 8,
  },
  linhaTabela: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
    paddingVertical: 8,
  },
  colDescricao: {
    fontSize: 11,
    flex: 2,
  },
  colQuantidade: {
    fontSize: 11,
    flex: 1,
    textAlign: "right",
  },
  colPrecoUnit: {
    fontSize: 11,
    flex: 1,
    textAlign: "right",
  },
  colSubtotal: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    flex: 1,
    textAlign: "right",
  },
  cabecalhoTexto: {
    fontSize: 9,
    color: "#78716c",
    textTransform: "uppercase",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 11,
    color: "#78716c",
    marginRight: 12,
  },
  totalValor: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  totalNota: {
    fontSize: 8,
    color: "#a8a29e",
    textAlign: "right",
    marginTop: 2,
  },
  rodape: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#a8a29e",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
    paddingTop: 12,
  },
});

type LinhaOrcamentoPdf = {
  descricao: string;
  quantidade: number;
  precoUnit: number;
};

type OrcamentoPdfProps = {
  empresaNome: string;
  empresaNif: string;
  empresaMorada?: string | null;
  empresaLogoUrl?: string | null;
  clienteNome: string;
  clienteEmail?: string | null;
  clienteTelefone?: string | null;
  clienteMorada?: string | null;
  linhas: LinhaOrcamentoPdf[];
  numeroOrcamento: string;
  data: string;
};

function formatarPreco(preco: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(preco);
}

export function OrcamentoPdf({
  empresaNome,
  empresaNif,
  empresaMorada,
  empresaLogoUrl,
  clienteNome,
  clienteEmail,
  clienteTelefone,
  clienteMorada,
  linhas,
  numeroOrcamento,
  data,
}: OrcamentoPdfProps) {
  const total = linhas.reduce(
    (soma, linha) => soma + linha.quantidade * linha.precoUnit,
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.empresaInfo}>
            {empresaLogoUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={empresaLogoUrl} style={styles.logo} />
            )}
            <View>
              <Text style={styles.empresaNome}>{empresaNome}</Text>
              <Text style={styles.empresaNif}>NIF {empresaNif}</Text>
              {empresaMorada && (
                <Text style={styles.empresaNif}>{empresaMorada}</Text>
              )}
            </View>
          </View>
          <View>
            <Text style={styles.tituloOrcamento}>ORÇAMENTO</Text>
            <Text style={styles.numeroOrcamento}>
              Nº {numeroOrcamento} · {data}
            </Text>
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.rotulo}>Cliente</Text>
          <Text style={styles.clienteNome}>{clienteNome}</Text>
          {clienteMorada && (
            <Text style={styles.clienteDetalhe}>{clienteMorada}</Text>
          )}
          {clienteTelefone && (
            <Text style={styles.clienteDetalhe}>{clienteTelefone}</Text>
          )}
          {clienteEmail && (
            <Text style={styles.clienteDetalhe}>{clienteEmail}</Text>
          )}
        </View>

        <View style={styles.tabela}>
          <View style={styles.linhaCabecalho}>
            <Text style={[styles.colDescricao, styles.cabecalhoTexto]}>
              Descrição
            </Text>
            <Text style={[styles.colQuantidade, styles.cabecalhoTexto]}>
              Qtd
            </Text>
            <Text style={[styles.colPrecoUnit, styles.cabecalhoTexto]}>
              Preço Unit.
            </Text>
            <Text style={[styles.colSubtotal, styles.cabecalhoTexto]}>
              Subtotal
            </Text>
          </View>
          {linhas.map((linha, index) => (
            <View key={index} style={styles.linhaTabela}>
              <Text style={styles.colDescricao}>{linha.descricao}</Text>
              <Text style={styles.colQuantidade}>{linha.quantidade}</Text>
              <Text style={styles.colPrecoUnit}>
                {formatarPreco(linha.precoUnit)}
              </Text>
              <Text style={styles.colSubtotal}>
                {formatarPreco(linha.quantidade * linha.precoUnit)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>{formatarPreco(total)}</Text>
        </View>
        <Text style={styles.totalNota}>Valor sem IVA</Text>

        <Text style={styles.rodape}>
          Este orçamento é válido por 30 dias a partir da data de emissão.
          Gerado com FlowOps.
        </Text>
      </Page>
    </Document>
  );
}