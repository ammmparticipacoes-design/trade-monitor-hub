import { useQuery } from "@tanstack/react-query";

const BASE_URL = "/trading_bot";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

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
