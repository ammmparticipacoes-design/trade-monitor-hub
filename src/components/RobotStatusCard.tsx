import { CheckCircle2, AlertTriangle, Loader2, ShoppingCart, TrendingDown, Copy } from "lucide-react";
import { useRobotStatus } from "@/hooks/useRobotApi";
import { useMemo } from "react";
import { toast } from "sonner";

function timeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  if (isNaN(then)) return "—";
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return `há ${diffSec} segundos`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} minuto${diffMin > 1 ? "s" : ""}`;
  const diffH = Math.floor(diffMin / 60);
  return `há ${diffH} hora${diffH > 1 ? "s" : ""}`;
}

const RobotStatusCard = () => {
  const { data, isLoading, isError } = useRobotStatus();

  const agoText = useMemo(() => {
    if (!data?.ultimo_batimento) return "—";
    return timeAgo(data.ultimo_batimento);
  }, [data?.ultimo_batimento]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Carregando status...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-loss" />
        <div>
          <p className="text-sm font-semibold text-loss">Sem conexão com o robô</p>
          <p className="text-xs text-muted-foreground">Não foi possível obter o status. API indisponível.</p>
        </div>
      </div>
    );
  }

  const isOperante = data.status === "OPERANTE";
  const isComprado = data.estado === "COMPRADO";

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-colors ${
        isOperante ? "border-profit/40 bg-profit/5" : "border-loss/40 bg-loss/5"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status principal */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isOperante ? (
            <CheckCircle2 className="h-10 w-10 text-profit shrink-0" />
          ) : (
            <AlertTriangle className="h-10 w-10 text-loss shrink-0" />
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Status do Robô</p>
            <p className={`text-2xl font-bold tracking-tight ${isOperante ? "text-profit" : "text-loss"}`}>
              {data.status}
            </p>
          </div>
        </div>

        {/* Estado da operação */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isComprado ? (
            <ShoppingCart className="h-7 w-7 text-profit shrink-0" />
          ) : (
            <TrendingDown className="h-7 w-7 text-warning shrink-0" />
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Estado Atual</p>
            <p className="text-lg font-semibold text-foreground">{data.estado}</p>
          </div>
        </div>

        {/* Último batimento */}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Último Batimento</p>
          <p className="text-lg font-semibold text-foreground">{agoText}</p>
        </div>

        {/* Endereço IP */}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Endereço IP</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-foreground">{data.ip || "—"}</p>
            {data.ip && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(data.ip);
                  toast.success("IP copiado para a área de transferência!");
                }}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Copiar IP"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* IP Anterior */}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">IP Anterior</p>
          <p className="text-lg font-semibold text-foreground">{data.ip_anterior || "—"}</p>
        </div>
      </div>
    </div>
  );
};

export default RobotStatusCard;
