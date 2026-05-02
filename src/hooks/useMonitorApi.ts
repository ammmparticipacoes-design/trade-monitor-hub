import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiFetch";

const BASE_URL = "/trading_bot";

const fetchApi = <T,>(endpoint: string) => fetchJson<T>(`${BASE_URL}${endpoint}`);

export interface MonitorRecord {
  data_hora: string;
  simbolo: "SOLUSDT" | "SOLUSDC";
  preco: number;
  bid: number;
  ask: number;
  spread_percent: number;
  range_percent: number;
  volume: number;
  taxa_percent: number;
}

export function useMonitorData() {
  return useQuery<MonitorRecord[]>({
    queryKey: ["monitor"],
    queryFn: () => fetchApi<MonitorRecord[]>("/api/api_monitor.asp"),
    refetchInterval: 30000,
    retry: 1,
  });
}
