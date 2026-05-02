/**
 * Utilitário central para chamadas HTTP que esperam JSON.
 *
 * Quando a resposta não é JSON válido, lança um erro detalhado contendo:
 *  - endpoint chamado
 *  - status HTTP
 *  - mensagem original do parser
 *  - posição (offset), linha e coluna do erro quando disponíveis
 *  - trecho do conteúdo ao redor do erro (com marcador ▶◀)
 *  - prévia do início da resposta
 *
 * Objetivo: facilitar o diagnóstico de respostas malformadas vindas das APIs
 * (.asp) durante o desenvolvimento.
 */

export class ApiJsonError extends Error {
  endpoint: string;
  status: number;
  rawSnippet: string;
  position?: number;
  line?: number;
  column?: number;

  constructor(message: string, opts: {
    endpoint: string;
    status: number;
    rawSnippet: string;
    position?: number;
    line?: number;
    column?: number;
  }) {
    super(message);
    this.name = "ApiJsonError";
    this.endpoint = opts.endpoint;
    this.status = opts.status;
    this.rawSnippet = opts.rawSnippet;
    this.position = opts.position;
    this.line = opts.line;
    this.column = opts.column;
  }
}

function extractPosition(errMsg: string): number | undefined {
  // Mensagens comuns:
  //   "Unexpected token < in JSON at position 0"
  //   "Unexpected end of JSON input"
  //   "Expected property name or '}' in JSON at position 12 (line 2 column 3)"
  const m = errMsg.match(/position\s+(\d+)/i);
  if (m) return Number(m[1]);
  return undefined;
}

function lineColFromPos(text: string, pos: number): { line: number; column: number } {
  const slice = text.slice(0, Math.max(0, pos));
  const lines = slice.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function buildSnippet(text: string, pos?: number): string {
  if (pos === undefined) return text.slice(0, 300);
  const start = Math.max(0, pos - 80);
  const end = Math.min(text.length, pos + 80);
  const before = text.slice(start, pos);
  const after = text.slice(pos, end);
  return `${start > 0 ? "…" : ""}${before}▶${after}◀${end < text.length ? "…" : ""}`;
}

export async function fetchJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, init);
  const text = await res.text();

  if (!res.ok) {
    throw new ApiJsonError(
      `API ${endpoint} retornou HTTP ${res.status}. Conteúdo: ${text.slice(0, 200)}`,
      { endpoint, status: res.status, rawSnippet: text.slice(0, 300) },
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const pos = extractPosition(msg);
    const lc = pos !== undefined ? lineColFromPos(text, pos) : undefined;
    const snippet = buildSnippet(text, pos);

    const detail = [
      `❌ JSON inválido em ${endpoint}`,
      `Erro: ${msg}`,
      pos !== undefined ? `Posição: ${pos}` : null,
      lc ? `Linha ${lc.line}, Coluna ${lc.column}` : null,
      `Trecho: ${snippet}`,
    ].filter(Boolean).join(" | ");

    // Loga no console para o desenvolvedor com o conteúdo completo
    // sem inundar a UI.
    // eslint-disable-next-line no-console
    console.error("[ApiJsonError]", {
      endpoint,
      status: res.status,
      message: msg,
      position: pos,
      line: lc?.line,
      column: lc?.column,
      snippet,
      fullResponse: text,
    });

    throw new ApiJsonError(detail, {
      endpoint,
      status: res.status,
      rawSnippet: snippet,
      position: pos,
      line: lc?.line,
      column: lc?.column,
    });
  }
}
