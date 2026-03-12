import { useQuery } from "@tanstack/react-query";

const BASE_URL = "/trading_bot";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface Operacao {
  id?: number;
  data?: string;
  ativo?: string;
  tipo?: string;
  entrada?: number;
  saida?: number;
  taxa?: number;
  lucro?: number;
  resultado?: string;
  estrategia?: string;
  [key: string]: unknown;
}

export interface Trade {
  id?: number;
  ativo?: string;
  tipo?: string;
  entrada?: number;
  quantidade?: number;
  preco_atual?: number;
  lucro_aberto?: number;
  estrategia?: string;
  [key: string]: unknown;
}

export interface LucroDia {
  data?: string;
  lucro?: number;
  operacoes?: number;
  [key: string]: unknown;
}

export function useOperacoes() {
  return useQuery<Operacao[]>({
    queryKey: ["operacoes"],
    queryFn: () => fetchApi<Operacao[]>("/api/api_operacoes.asp"),
    refetchInterval: 15000,
    retry: 1,
  });
}

export function useTrades() {
  return useQuery<Trade[]>({
    queryKey: ["trades"],
    queryFn: () => fetchApi<Trade[]>("/api/api_trades.asp"),
    refetchInterval: 10000,
    retry: 1,
  });
}

export function useLucros() {
  return useQuery<LucroDia[]>({
    queryKey: ["lucros"],
    queryFn: () => fetchApi<LucroDia[]>("/api/api_lucros.asp"),
    refetchInterval: 30000,
    retry: 1,
  });
}
