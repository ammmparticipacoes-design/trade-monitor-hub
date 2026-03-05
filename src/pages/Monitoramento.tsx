import { useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useMonitorData, MonitorRecord } from "@/hooks/useMonitorApi";
import { Loader2, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

type Periodo = "1h" | "4h" | "24h";

const periodLabels: Record<Periodo, string> = {
  "1h": "Última hora",
  "4h": "Últimas 4 horas",
  "24h": "Últimas 24 horas",
};

function filterByPeriod(records: MonitorRecord[], periodo: Periodo): MonitorRecord[] {
  const now = Date.now();
  const ms: Record<Periodo, number> = {
    "1h": 3600_000,
    "4h": 14400_000,
    "24h": 86400_000,
  };
  const cutoff = now - ms[periodo];
  return records.filter((r) => new Date(r.data_hora).getTime() >= cutoff);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const Monitoramento = () => {
  const { data, isLoading, isError } = useMonitorData();
  const [periodo, setPeriodo] = useState<Periodo>("1h");

  const filtered = useMemo(() => {
    if (!data) return [];
    return filterByPeriod(data, periodo);
  }, [data, periodo]);

  const bySymbol = useMemo(() => {
    const sol: MonitorRecord[] = [];
    const sdc: MonitorRecord[] = [];
    filtered.forEach((r) => {
      if (r.simbolo === "SOLUSDT") sol.push(r);
      else sdc.push(r);
    });
    return { SOLUSDT: sol, SOLUSDC: sdc };
  }, [filtered]);

  const lastValues = useMemo(() => {
    const last = (arr: MonitorRecord[]) => arr.length ? arr[arr.length - 1] : null;
    return {
      SOLUSDT: last(bySymbol.SOLUSDT),
      SOLUSDC: last(bySymbol.SOLUSDC),
    };
  }, [bySymbol]);

  const custoTotal = (r: MonitorRecord | null) =>
    r ? r.spread_percent + r.taxa_percent : Infinity;

  const menorCusto =
    custoTotal(lastValues.SOLUSDT) <= custoTotal(lastValues.SOLUSDC) ? "SOLUSDT" : "SOLUSDC";
  const maiorSpread =
    (lastValues.SOLUSDT?.spread_percent ?? 0) >= (lastValues.SOLUSDC?.spread_percent ?? 0)
      ? "SOLUSDT"
      : "SOLUSDC";

  // Merge data for charts (aligned by time)
  const chartData = useMemo(() => {
    const map = new Map<string, Record<string, number | string>>();
    filtered.forEach((r) => {
      const key = r.data_hora;
      if (!map.has(key)) map.set(key, { time: formatTime(key) });
      const entry = map.get(key)!;
      const prefix = r.simbolo === "SOLUSDT" ? "usdt" : "usdc";
      entry[`${prefix}_preco`] = r.preco;
      entry[`${prefix}_spread`] = r.spread_percent;
      entry[`${prefix}_custo`] = r.spread_percent + r.taxa_percent;
    });
    return Array.from(map.values());
  }, [filtered]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando monitoramento...
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="flex items-center gap-3 py-20 justify-center text-loss">
          <AlertTriangle className="h-6 w-6" />
          Erro ao carregar dados de monitoramento.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header + filtro */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">Monitoramento de Pares</h1>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(Object.keys(periodLabels) as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  periodo === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela resumida comparativa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["SOLUSDT", "SOLUSDC"] as const).map((sym) => {
            const r = lastValues[sym];
            const isMenorCusto = menorCusto === sym;
            const isMaiorSpread = maiorSpread === sym;
            return (
              <div
                key={sym}
                className={`rounded-lg border-2 p-5 transition-colors ${
                  isMenorCusto ? "border-profit/40 bg-profit/5" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">{sym}</h3>
                  <div className="flex gap-2">
                    {isMenorCusto && (
                      <span className="text-xs bg-profit/20 text-profit px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" /> Menor custo
                      </span>
                    )}
                    {isMaiorSpread && (
                      <span className="text-xs bg-loss/20 text-loss px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Maior spread
                      </span>
                    )}
                  </div>
                </div>
                {r ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Metric label="Último Preço" value={`$${r.preco.toFixed(4)}`} />
                    <Metric
                      label="Spread %"
                      value={`${r.spread_percent.toFixed(4)}%`}
                      highlight={isMaiorSpread ? "loss" : undefined}
                    />
                    <Metric label="Range %" value={`${r.range_percent.toFixed(4)}%`} />
                    <Metric label="Volume" value={r.volume.toLocaleString("pt-BR")} />
                    <Metric label="Taxa %" value={`${r.taxa_percent.toFixed(4)}%`} />
                    <Metric
                      label="Custo Total"
                      value={`${custoTotal(r).toFixed(4)}%`}
                      highlight={isMenorCusto ? "profit" : undefined}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem dados no período.</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Gráficos */}
        {chartData.length > 0 && (
          <div className="space-y-6">
            <ChartCard title="Preço ao longo do tempo" dataKey="preco" data={chartData} />
            <ChartCard title="Spread % ao longo do tempo" dataKey="spread" data={chartData} suffix="%" />
            <ChartCard title="Custo Total % ao longo do tempo" dataKey="custo" data={chartData} suffix="%" />
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Atualização automática a cada 30 segundos
        </p>
      </div>
    </AppLayout>
  );
};

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "profit" | "loss";
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p
        className={`text-base font-bold ${
          highlight === "profit"
            ? "text-profit"
            : highlight === "loss"
            ? "text-loss"
            : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  dataKey,
  data,
  suffix = "",
}: {
  title: string;
  dataKey: string;
  data: Record<string, unknown>[];
  suffix?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              width={70}
              tickFormatter={(v: number) => `${v}${suffix}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value.toFixed(4)}${suffix}`, undefined]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={`usdt_${dataKey}`}
              name="SOLUSDT"
              stroke="hsl(var(--profit))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey={`usdc_${dataKey}`}
              name="SOLUSDC"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Monitoramento;
