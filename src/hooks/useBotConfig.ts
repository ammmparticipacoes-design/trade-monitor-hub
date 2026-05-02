import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiFetch";

const BASE_URL = "/trading_bot";

export interface BotConfig {
  id?: number;
  symbol: string;
  candle_duplo_compra_ativo: boolean;
  candle_duplo_venda_ativo: boolean;
  intrabar_compra_ativo: boolean;
  intrabar_venda_ativo: boolean;
  intrabar_percentual_compra: number;
  intrabar_percentual_venda: number;
  mean_reversao_ativo: boolean;
  mean_reversao_percentual_entrada: number;
  mean_reversao_percentual_alvo: number;
  mrcurta_ativa: boolean;
  mrcurta_candles: number;
  mrcurta_percentual: number;
  mrlonga_ativa: boolean;
  mrlonga_candles: number;
  mrlonga_percentual: number;
  mr_confirmacao_candles: number;
  mr_confirmacao_percentual: number;
  considerar_emas: boolean;
  supertrend_ativo: boolean;
  considerar_stoch_rsi: boolean;
  considerar_adx: boolean;
  take_profit_percentual: number;
  stop_loss_percentual: number;
  valor_operacao: number;
  bot_ativo: boolean;
  updated_at?: string;
}

const defaultConfig: BotConfig = {
  symbol: "SOLUSDT",
  candle_duplo_compra_ativo: false,
  candle_duplo_venda_ativo: false,
  intrabar_compra_ativo: false,
  intrabar_venda_ativo: false,
  intrabar_percentual_compra: 0,
  intrabar_percentual_venda: 0,
  mean_reversao_ativo: false,
  mean_reversao_percentual_entrada: 0,
  mean_reversao_percentual_alvo: 0,
  mrcurta_ativa: true,
  mrcurta_candles: 6,
  mrcurta_percentual: 0.003,
  mrlonga_ativa: true,
  mrlonga_candles: 16,
  mrlonga_percentual: 0.005,
  mr_confirmacao_candles: 2,
  mr_confirmacao_percentual: 0.005,
  considerar_emas: false,
  supertrend_ativo: false,
  considerar_stoch_rsi: false,
  considerar_adx: false,
  take_profit_percentual: 0,
  stop_loss_percentual: 0,
  valor_operacao: 0,
  bot_ativo: false,
};

async function fetchConfig(symbol: string): Promise<BotConfig> {
  return fetchJson<BotConfig>(`${BASE_URL}/api/api_config.asp?symbol=${encodeURIComponent(symbol)}`);
}

async function saveConfig(config: BotConfig): Promise<BotConfig> {
  return fetchJson<BotConfig>(`${BASE_URL}/api/api_config_save.asp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
}

export function useBotConfig(symbol: string) {
  return useQuery<BotConfig>({
    queryKey: ["bot_config", symbol],
    queryFn: () => fetchConfig(symbol),
    retry: 1,
    placeholderData: { ...defaultConfig, symbol },
  });
}

export function useSaveBotConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveConfig,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bot_config", data.symbol] });
    },
  });
}
