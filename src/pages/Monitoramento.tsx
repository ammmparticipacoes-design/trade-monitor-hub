import { useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLogData, useLogTypes, LogRecord } from "@/hooks/useLogApi";
import { Loader2, AlertTriangle, Copy, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 30;

const tipoColors: Record<string, string> = {
  info: "text-primary",
  warning: "text-warning",
  error: "text-destructive",
  trade: "text-profit",
};

const tipoBgColors: Record<string, string> = {
  info: "bg-primary/10",
  warning: "bg-warning/10",
  error: "bg-destructive/10",
  trade: "bg-profit/10",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDateOnly(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

const Monitoramento = () => {
  const { data: logs, isLoading, isError, error } = useLogData();
  const { data: logTypes } = useLogTypes();

  const availableTypes = useMemo(() => {
    if (logTypes && logTypes.length > 0) return logTypes.map((t) => t.name);
    return ["info", "warning", "error", "trade"];
  }, [logTypes]);

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(["info", "warning", "error", "trade"])
  );
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);

  const toggleType = (tipo: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (!logs) return [];
    return logs.filter((r) => {
      if (!selectedTypes.has(r.tipo.toLowerCase())) return false;
      if (dataInicio) {
        const d = new Date(r.datahora);
        const inicio = new Date(dataInicio + "T00:00:00");
        if (d < inicio) return false;
      }
      if (dataFim) {
        const d = new Date(r.datahora);
        const fim = new Date(dataFim + "T23:59:59");
        if (d > fim) return false;
      }
      return true;
    });
  }, [logs, selectedTypes, dataInicio, dataFim]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCopy = () => {
    const text = filtered
      .map(
        (r) =>
          `[${formatDateTime(r.datahora)}] [${r.tipo.toUpperCase()}] ${r.descricao}`
      )
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Logs copiados para a área de transferência");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando logs...
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    const err = error as any;
    const isJsonErr = err?.name === "ApiJsonError";
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-10 space-y-4">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-lg font-bold">Erro ao carregar logs da plataforma</h2>
          </div>
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-2 text-sm">
            <div>
              <span className="font-semibold">Mensagem:</span>{" "}
              <span className="font-mono">{err?.message ?? String(err)}</span>
            </div>
            {isJsonErr && (
              <>
                {err.endpoint && (
                  <div>
                    <span className="font-semibold">Endpoint:</span>{" "}
                    <span className="font-mono">{err.endpoint}</span>
                  </div>
                )}
                {typeof err.status === "number" && (
                  <div>
                    <span className="font-semibold">HTTP Status:</span>{" "}
                    <span className="font-mono">{err.status}</span>
                  </div>
                )}
                {(err.line || err.column || err.position !== undefined) && (
                  <div>
                    <span className="font-semibold">Posição:</span>{" "}
                    <span className="font-mono">
                      offset {err.position ?? "?"} — linha {err.line ?? "?"}, coluna {err.column ?? "?"}
                    </span>
                  </div>
                )}
                {err.rawSnippet && (
                  <div>
                    <div className="font-semibold mb-1">Trecho da resposta:</div>
                    <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap break-all">
{err.rawSnippet}
                    </pre>
                  </div>
                )}
              </>
            )}
            <p className="text-xs text-muted-foreground pt-2">
              Detalhes completos (incluindo a resposta inteira da API) também estão no console do navegador (F12).
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">
            Log da Plataforma
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2 self-start"
          >
            {copied ? (
              <Check className="h-4 w-4 text-profit" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copiado" : "Copiar logs"}
          </Button>
        </div>

        {/* Filters */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-foreground">
              Filtrar por tipo:
            </span>
            {availableTypes.map((tipo) => (
              <label
                key={tipo}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedTypes.has(tipo)}
                  onCheckedChange={() => toggleType(tipo)}
                />
                <span
                  className={`text-sm font-medium capitalize ${tipoColors[tipo] ?? "text-foreground"}`}
                >
                  {tipo}
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-foreground">
              Período:
            </span>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => {
                setDataInicio(e.target.value);
                setPage(1);
              }}
              className="w-40 h-9 text-sm"
              placeholder="Data início"
            />
            <span className="text-muted-foreground text-sm">até</span>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => {
                setDataFim(e.target.value);
                setPage(1);
              }}
              className="w-40 h-9 text-sm"
              placeholder="Data fim"
            />
          </div>
        </div>

        {/* Log table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[170px]">
                  Data/Hora
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[90px]">
                  Tipo
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Descrição
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum log encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, i) => {
                  const prevRow = i > 0 ? paginatedData[i - 1] : null;
                  const showDateSep =
                    prevRow &&
                    formatDateOnly(row.datahora) !==
                      formatDateOnly(prevRow.datahora);
                  const tipo = row.tipo.toLowerCase();

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-muted/50 transition-colors ${
                        showDateSep ? "border-t-2 border-primary/30" : ""
                      }`}
                    >
                      <td className="px-4 py-2 text-foreground whitespace-nowrap font-mono text-xs">
                        {formatDateTime(row.datahora)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${tipoBgColors[tipo] ?? "bg-muted"} ${tipoColors[tipo] ?? "text-foreground"}`}
                        >
                          {row.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-foreground text-xs">
                        {row.descricao}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {filtered.length} registro(s) — Página {currentPage} de{" "}
              {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Atualização automática a cada 15 segundos
        </p>
      </div>
    </AppLayout>
  );
};

export default Monitoramento;
