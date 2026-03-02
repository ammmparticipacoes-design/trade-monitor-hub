import { Loader2, AlertCircle } from "lucide-react";

interface DataTableProps<T> {
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  columns: { key: string; label: string; render?: (value: unknown, row: T) => React.ReactNode }[];
  emptyMessage?: string;
}

function DataTable<T extends Record<string, unknown>>({
  data,
  isLoading,
  isError,
  columns,
  emptyMessage = "Nenhum dado encontrado",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
        <span className="text-sm">Erro ao carregar dados. A API pode estar indisponível.</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <span className="text-sm">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-table-header">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-table-hover transition-colors even:bg-table-stripe">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2.5 whitespace-nowrap text-foreground">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
