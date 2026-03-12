import AppLayout from "@/components/AppLayout";
import DataTable from "@/components/DataTable";
import { useOperacoes, Operacao } from "@/hooks/useTradeApi";

const formatCurrency = (val: unknown) => {
  if (typeof val !== "number") return "—";
  return val.toLocaleString("pt-BR", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
};

const Operacoes = () => {
  const { data, isLoading, isError } = useOperacoes();

  const columns = [
    {
      key: "data",
      label: "Data",
      render: (value: unknown) => (typeof value === "string" ? value : "—"),
    },
    {
      key: "ativo",
      label: "Ativo",
      render: (value: unknown) => String(value ?? "—"),
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (value: unknown, row: Operacao) => {
        const tipo = String(value ?? "—");
        const isCompra = tipo.toUpperCase() === "COMPRA";
        return (
          <span className={isCompra ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
            {tipo}
          </span>
        );
      },
    },
    {
      key: "entrada",
      label: "Entrada (USDT)",
      render: (value: unknown) => formatCurrency(value),
    },
    {
      key: "saida",
      label: "Saída (USDT)",
      render: (value: unknown) => formatCurrency(value),
    },
    {
      key: "taxa",
      label: "Taxa",
      render: (value: unknown) => formatCurrency(value),
    },
    {
      key: "lucro",
      label: "Resultado",
      render: (value: unknown) => {
        if (typeof value !== "number") return "—";
        const color = value > 0 ? "text-green-500" : value < 0 ? "text-red-500" : "text-muted-foreground";
        return <span className={`font-medium ${color}`}>{formatCurrency(value)}</span>;
      },
    },
    {
      key: "estrategia",
      label: "Estratégia",
      render: (value: unknown) => String(value ?? "—"),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-foreground">Operações Realizadas</h1>
        <DataTable<Operacao>
          data={data}
          isLoading={isLoading}
          isError={isError}
          columns={columns}
          emptyMessage="Nenhuma operação registrada"
        />
      </div>
    </AppLayout>
  );
};

export default Operacoes;
