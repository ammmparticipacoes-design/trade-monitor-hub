import { useOperacoes, useTrades, Operacao, Trade } from "@/hooks/useTradeApi";
import AppLayout from "@/components/AppLayout";
import DataTable from "@/components/DataTable";
import { TrendingDown, TrendingUp, Activity, Crosshair } from "lucide-react";

const formatCurrency = (val: unknown) => {
  const num = Number(val);
  if (isNaN(num)) return "—";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const ProfitCell = ({ value }: { value: unknown }) => {
  const num = Number(value);
  if (isNaN(num)) return <span>—</span>;
  return (
    <span className={`font-mono font-medium ${num >= 0 ? "text-profit" : "text-loss"}`}>
      {num >= 0 ? "+" : ""}
      {formatCurrency(num)}
    </span>
  );
};

const StrategyIcon = ({ strategy }: { strategy: unknown }) => {
  const s = String(strategy ?? "").toLowerCase();
  if (s.includes("trailing")) return <Crosshair className="h-3.5 w-3.5 text-warning inline mr-1" />;
  if (s.includes("cruzamento") || s.includes("ma")) return <Activity className="h-3.5 w-3.5 text-primary inline mr-1" />;
  return null;
};

const operacoesColumns = [
  { key: "data", label: "Data" },
  { key: "ativo", label: "Ativo" },
  {
    key: "tipo",
    label: "Tipo",
    render: (val: unknown) => (
      <span className="flex items-center gap-1">
        {String(val).toLowerCase() === "compra" ? (
          <TrendingUp className="h-3.5 w-3.5 text-profit" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-loss" />
        )}
        {String(val)}
      </span>
    ),
  },
  { key: "entrada", label: "Entrada", render: (val: unknown) => formatCurrency(val) },
  { key: "saida", label: "Saída", render: (val: unknown) => formatCurrency(val) },
  {
    key: "lucro",
    label: "Lucro",
    render: (val: unknown) => <ProfitCell value={val} />,
  },
  {
    key: "estrategia",
    label: "Estratégia",
    render: (val: unknown) => (
      <span className="flex items-center">
        <StrategyIcon strategy={val} />
        {String(val ?? "—")}
      </span>
    ),
  },
];

const tradesColumns = [
  { key: "ativo", label: "Ativo" },
  {
    key: "tipo",
    label: "Tipo",
    render: (val: unknown) => (
      <span className="flex items-center gap-1">
        {String(val).toLowerCase() === "compra" ? (
          <TrendingUp className="h-3.5 w-3.5 text-profit" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-loss" />
        )}
        {String(val)}
      </span>
    ),
  },
  { key: "entrada", label: "Entrada", render: (val: unknown) => formatCurrency(val) },
  { key: "quantidade", label: "Qtd" },
  { key: "preco_atual", label: "Preço Atual", render: (val: unknown) => formatCurrency(val) },
  {
    key: "lucro_aberto",
    label: "Lucro Aberto",
    render: (val: unknown) => <ProfitCell value={val} />,
  },
  {
    key: "estrategia",
    label: "Estratégia",
    render: (val: unknown) => (
      <span className="flex items-center">
        <StrategyIcon strategy={val} />
        {String(val ?? "—")}
      </span>
    ),
  },
];

const Dashboard = () => {
  const operacoes = useOperacoes();
  const trades = useTrades();

  return (
    <AppLayout>
      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Trades Abertos</h2>
            {trades.isFetching && !trades.isLoading && (
              <span className="text-xs text-muted-foreground animate-pulse-soft">Atualizando...</span>
            )}
          </div>
          <DataTable
            data={trades.data}
            isLoading={trades.isLoading}
            isError={trades.isError}
            columns={tradesColumns}
            emptyMessage="Nenhum trade aberto no momento"
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Operações Realizadas</h2>
            {operacoes.isFetching && !operacoes.isLoading && (
              <span className="text-xs text-muted-foreground animate-pulse-soft">Atualizando...</span>
            )}
          </div>
          <DataTable
            data={operacoes.data}
            isLoading={operacoes.isLoading}
            isError={operacoes.isError}
            columns={operacoesColumns}
            emptyMessage="Nenhuma operação registrada"
          />
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
