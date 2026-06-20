import {
  Document,
  Page,
  Text,
  View,
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
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
    paddingVertical: 12,
  },
  linhaTabela: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  descricaoTexto: {
    fontSize: 11,
    flex: 1,
  },
  precoTexto: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
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

type OrcamentoPdfProps = {
  empresaNome: string;
  empresaNif: string;
  clienteNome: string;
  clienteEmail?: string | null;
  clienteTelefone?: string | null;
  clienteMorada?: string | null;
  descricao: string;
  preco: number;
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
  clienteNome,
  clienteEmail,
  clienteTelefone,
  clienteMorada,
  descricao,
  preco,
  numeroOrcamento,
  data,
}: OrcamentoPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.empresaNome}>{empresaNome}</Text>
            <Text style={styles.empresaNif}>NIF {empresaNif}</Text>
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
          <View style={styles.linhaTabela}>
            <Text style={styles.descricaoTexto}>{descricao}</Text>
            <Text style={styles.precoTexto}>{formatarPreco(preco)}</Text>
          </View>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>{formatarPreco(preco)}</Text>
        </View>

        <Text style={styles.rodape}>
          Este orçamento é válido por 30 dias a partir da data de emissão.
          Gerado com FlowOps.
        </Text>
      </Page>
    </Document>
  );
}