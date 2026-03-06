import { useLeituras, LeituraMercado } from "@/hooks/useRobotApi";
import { Loader2, AlertCircle } from "lucide-react";

const formatNum = (val: number, decimals = 4) =>
  isNaN(val) ? "—" : val.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const LeiturasTable = () => {
  const { data, isLoading, isError, isFetching } = useLeituras();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Carregando leituras...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
        <span className="text-sm">Erro ao carregar leituras. API indisponível.</span>
      </div>
    );
  }

  const rows = (data ?? []).slice(0, 50);

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <span className="text-sm">Nenhuma leitura disponível</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-table-header">
            {["Data/Hora", "Preço (SOL/USDT)", "Parâmetros", "Estado"].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-table-hover transition-colors even:bg-table-stripe">
              <td className="px-4 py-2.5 whitespace-nowrap text-foreground font-mono text-xs">
                {row.data_hora ?? "—"}
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap text-foreground font-mono">
                {formatNum(row.preco)}
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap text-foreground font-mono text-xs">
                MM7: {formatNum(row.mm7)} | MM40: {formatNum(row.mm40)}
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    row.estado === "COMPRADO"
                      ? "bg-profit/15 text-profit"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {row.estado ?? "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isFetching && !isLoading && (
        <div className="text-center py-1">
          <span className="text-xs text-muted-foreground animate-pulse-soft">Atualizando...</span>
        </div>
      )}
    </div>
  );
};

export default LeiturasTable;
