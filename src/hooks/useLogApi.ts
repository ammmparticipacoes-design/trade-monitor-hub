import { useQuery } from "@tanstack/react-query";

const BASE_URL = "/trading_bot";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface LogType {
  id: number;
  name: string;
}

export interface LogRecord {
  id: number;
  datahora: string;
  descricao: string;
  tipo: string;
}

export function useLogTypes() {
  return useQuery<LogType[]>({
    queryKey: ["log_types"],
    queryFn: () => fetchApi<LogType[]>("/api/api_log_types.asp"),
    staleTime: 60000,
  });
}

export function useLogData() {
  return useQuery<LogRecord[]>({
    queryKey: ["logs"],
    queryFn: () => fetchApi<LogRecord[]>("/api/api_logs.asp"),
    refetchInterval: 15000,
    retry: 1,
  });
}
