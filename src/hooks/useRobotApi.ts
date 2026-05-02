import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiFetch";

const BASE_URL = "/trading_bot";

const fetchApi = <T,>(endpoint: string) => fetchJson<T>(`${BASE_URL}${endpoint}`);

export interface RobotStatus {
  status: "OPERANTE" | "INOPERANTE";
  estado: "COMPRADO" | "VENDIDO";
  ultimo_batimento: string; // ISO datetime
  ip: string;
  ip_anterior: string;
  nome_robo: string;
  [key: string]: unknown;
}

export interface LeituraMercado {
  data_hora: string;
  preco: number;
  parametros: string;
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
