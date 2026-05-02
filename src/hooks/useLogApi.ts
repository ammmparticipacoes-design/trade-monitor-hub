import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiFetch";

const BASE_URL = "/trading_bot";

const fetchApi = <T,>(endpoint: string) => fetchJson<T>(`${BASE_URL}${endpoint}`);

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
