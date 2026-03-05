import { useQuery } from "@tanstack/react-query";

const BASE_URL = "/trading_bot";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface RobotStatus {
  status: "OPERANTE" | "INOPERANTE";
  estado: "COMPRADO" | "VENDIDO";
  ultimo_batimento: string; // ISO datetime
  ip: string;
  ip_anterior: string;
  [key: string]: unknown;
}

export interface LeituraMercado {
  data_hora: string;
  preco: number;
  mm7: number;
  mm40: number;
  estado: "COMPRADO" | "VENDIDO";
  [key: string]: unknown;
}

export function useRobotStatus() {
  return useQuery<RobotStatus>({
    queryKey: ["robot-status"],
    queryFn: () => fetchApi<RobotStatus>("/api/api_status.asp"),
    refetchInterval: 5000,
    retry: 1,
  });
}

export function useLeituras() {
  return useQuery<LeituraMercado[]>({
    queryKey: ["leituras"],
    queryFn: () => fetchApi<LeituraMercado[]>("/api/api_leituras.asp"),
    refetchInterval: 10000,
    retry: 1,
  });
}
