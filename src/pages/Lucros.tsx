import { useState, useMemo } from "react";
import { useLucros, LucroDia } from "@/hooks/useTradeApi";
import AppLayout from "@/components/AppLayout";
import DataTable from "@/components/DataTable";
import { ArrowUpDown } from "lucide-react";

const formatCurrency = (val: unknown) => {
  const num = Number(val);
  if (isNaN(num)) return "—";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

type SortKey = "data" | "lucro";
type SortDir = "asc" | "desc";

const Lucros = () => {
  const { data, isLoading, isError, isFetching } = useLucros();
  const [sortKey, setSortKey] = useState<SortKey>("data");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "data") {
        cmp = String(a.data ?? "").localeCompare(String(b.data ?? ""));
      } else {
        cmp = (Number(a.lucro) || 0) - (Number(b.lucro) || 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalLucro = useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, d) => sum + (Number(d.lucro) || 0), 0);
  }, [data]);

  const columns = [
    {
      key: "data",
      label: "Data",
      render: (val: unknown) => <span className="font-mono text-xs">{String(val ?? "—")}</span>,
    },
    {
      key: "lucro",
      label: "Lucro",
      render: (val: unknown) => {
        const num = Number(val);
        if (isNaN(num)) return "—";
        return (
          <span className={`font-mono font-medium ${num >= 0 ? "text-profit" : "text-loss"}`}>
            {num >= 0 ? "+" : ""}
            {formatCurrency(num)}
          </span>
        );
      },
    },
    { key: "operacoes", label: "Operações" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Lucro Diário</h2>
          <div className="flex items-center gap-4">
            {isFetching && !isLoading && (
              <span className="text-xs text-muted-foreground animate-pulse-soft">Atualizando...</span>
            )}
            <div className="text-sm">
              Total:{" "}
              <span className={`font-mono font-semibold ${totalLucro >= 0 ? "text-profit" : "text-loss"}`}>
                {totalLucro >= 0 ? "+" : ""}
                {formatCurrency(totalLucro)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          {(["data", "lucro"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border transition-colors ${
                sortKey === key
                  ? "bg-primary/10 border-primary/30 text-foreground"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpDown className="h-3 w-3" />
              {key === "data" ? "Data" : "Lucro"}
              {sortKey === key && (sortDir === "asc" ? " ↑" : " ↓")}
            </button>
          ))}
        </div>

        <DataTable
          data={sorted}
          isLoading={isLoading}
          isError={isError}
          columns={columns}
          emptyMessage="Nenhum dado de lucro disponível"
        />
      </div>
    </AppLayout>
  );
};

export default Lucros;
