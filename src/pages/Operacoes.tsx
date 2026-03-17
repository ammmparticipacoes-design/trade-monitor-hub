import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { useOperacoes, Operacao } from "@/hooks/useTradeApi";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 20;

const formatCurrencyStyled = (val: unknown, colorClass?: string) => {
  if (typeof val !== "number") return <span>—</span>;
  const fixed = val.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const cls = colorClass ?? "";
  return (
    <span className={`font-medium ${cls}`}>
      <span>{intPart}.</span>
      <span className="text-[0.75em] opacity-70">{decPart}</span>
    </span>
  );
};

const Operacoes = () => {
  const { data, isLoading, isError } = useOperacoes();
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  }, [data]);

  const pagedData = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  }, [data, page]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm">Carregando...</span>
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
          <span className="text-sm">Erro ao carregar dados. A API pode estar indisponível.</span>
        </div>
      </AppLayout>
    );
  }

  if (!data || data.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <span className="text-sm">Nenhuma operação registrada</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-foreground">Operações Realizadas</h1>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-table-header">
                {["Data", "Ativo", "Tipo", "Entrada (USDT)", "Saída (USDT)", "Taxa", "Resultado", "Estratégia"].map(
                  (label) => (
                    <th
                      key={label}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {label}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {pagedData.map((row, i) => {
                const prevRow = i > 0 ? pagedData[i - 1] : null;
                const isDayBreak = prevRow && prevRow.data !== row.data;

                return (
                  <tr
                    key={i}
                    className={`hover:bg-table-hover transition-colors even:bg-table-stripe ${
                      isDayBreak ? "border-t-2 border-primary/40" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap text-foreground">
                      {typeof row.data === "string" ? row.data : "—"}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-foreground">
                      {String(row.ativo ?? "—")}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {(() => {
                        const tipo = String(row.tipo ?? "—");
                        const isCompra = tipo.toUpperCase() === "COMPRA";
                        return (
                          <span className={isCompra ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                            {tipo}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-foreground">
                      {formatCurrencyStyled(row.entrada)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-foreground">
                      {formatCurrencyStyled(row.saida)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-foreground">
                      {formatCurrencyStyled(row.taxa)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {(() => {
                        const val = row.lucro;
                        if (typeof val !== "number") return "—";
                        const color = val > 0 ? "text-green-500" : val < 0 ? "text-red-500" : "text-muted-foreground";
                        return formatCurrencyStyled(val, color);
                      })()}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-foreground">
                      {String(row.estrategia ?? "—")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages} ({data.length} operações)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (page <= 3) {
                  pageNum = idx + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = page - 2 + idx;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="min-w-[2rem]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Operacoes;
