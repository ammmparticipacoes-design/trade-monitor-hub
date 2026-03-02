# Trade Bot — Documentação Técnica

## Visão Geral

Sistema front-end para monitoramento em tempo real de um robô de trading (SOL/USDT).

---

## Páginas

| Rota      | Descrição                                      |
|-----------|-------------------------------------------------|
| `/login`  | Formulário de login (credenciais fixas)         |
| `/`       | Dashboard — status do robô + leituras de mercado|
| `/lucros` | Lucro diário acumulado                          |

---

## APIs Consumidas

### 1. `GET /api_status.asp` — Status do Robô

Retorna o estado atual do robô. Atualização a cada **5 segundos**.

**Resposta JSON:**

```json
{
  "status": "OPERANTE",
  "estado": "COMPRADO",
  "ultimo_batimento": "2026-03-02T14:30:15"
}
```

| Campo              | Tipo     | Valores possíveis          | Descrição                        |
|--------------------|----------|----------------------------|----------------------------------|
| `status`           | string   | `OPERANTE`, `INOPERANTE`   | Se o robô está ativo             |
| `estado`           | string   | `COMPRADO`, `VENDIDO`      | Posição atual do robô            |
| `ultimo_batimento` | string   | ISO 8601 datetime          | Última vez que o robô respondeu  |

---

### 2. `GET /api_leituras.asp` — Leituras de Mercado

Retorna array com as últimas leituras do mercado, ordenadas do mais recente para o mais antigo. O front exibe as **50 primeiras**.

Atualização a cada **10 segundos**.

**Resposta JSON:**

```json
[
  {
    "data_hora": "2026-03-02 14:30:00",
    "preco": 142.5312,
    "mm7": 141.8900,
    "mm40": 140.2100,
    "estado": "COMPRADO"
  },
  {
    "data_hora": "2026-03-02 14:29:00",
    "preco": 142.1200,
    "mm7": 141.7500,
    "mm40": 140.1800,
    "estado": "COMPRADO"
  }
]
```

| Campo      | Tipo    | Descrição                          |
|------------|---------|------------------------------------|
| `data_hora`| string  | Data e hora da leitura             |
| `preco`    | number  | Preço atual de SOL/USDT            |
| `mm7`      | number  | Média Móvel de 7 períodos          |
| `mm40`     | number  | Média Móvel de 40 períodos         |
| `estado`   | string  | Estado naquele momento (COMPRADO/VENDIDO) |

---

### 3. `GET /api_operacoes.asp` — Operações Realizadas (existente)

```json
[
  {
    "data": "2026-03-01",
    "ativo": "SOL/USDT",
    "tipo": "COMPRA",
    "entrada": 140.50,
    "saida": 143.20,
    "lucro": 2.70,
    "estrategia": "Cruzamento MA"
  }
]
```

---

### 4. `GET /api_trades.asp` — Trades Abertos (existente)

```json
[
  {
    "ativo": "SOL/USDT",
    "tipo": "COMPRA",
    "entrada": 142.00,
    "quantidade": 10,
    "preco_atual": 142.53,
    "lucro_aberto": 5.30,
    "estrategia": "Trailing Stop"
  }
]
```

---

### 5. `GET /api_lucros.asp` — Lucros Diários (existente)

```json
[
  {
    "data": "2026-03-01",
    "lucro": 15.40,
    "operacoes": 3
  }
]
```

---

## Banco de Dados (Backend)

### Tabela `tb_status_robo`

| Coluna             | Tipo         | Descrição                        |
|--------------------|--------------|----------------------------------|
| `id`               | INT (PK)     | Identificador                    |
| `status`           | VARCHAR(20)  | OPERANTE / INOPERANTE            |
| `estado`           | VARCHAR(20)  | COMPRADO / VENDIDO               |
| `ultimo_batimento` | DATETIME     | Timestamp do último heartbeat    |

> Registro único, sempre atualizado pelo robô.

---

### Tabela `tb_leituras`

| Coluna      | Tipo          | Descrição                              |
|-------------|---------------|----------------------------------------|
| `id`        | INT (PK, AI)  | Identificador auto-incremento          |
| `data_hora` | DATETIME      | Momento da leitura                     |
| `preco`     | DECIMAL(12,4) | Preço SOL/USDT                         |
| `mm7`       | DECIMAL(12,4) | Média Móvel 7                          |
| `mm40`      | DECIMAL(12,4) | Média Móvel 40                         |
| `estado`    | VARCHAR(20)   | COMPRADO / VENDIDO                     |

> Inserção contínua pelo robô. API retorna `ORDER BY data_hora DESC`.

---

### Tabela `tb_operacoes` (existente)

| Coluna       | Tipo          | Descrição                  |
|--------------|---------------|----------------------------|
| `id`         | INT (PK, AI)  | Identificador              |
| `data`       | DATE          | Data da operação           |
| `ativo`      | VARCHAR(20)   | Par negociado              |
| `tipo`       | VARCHAR(10)   | COMPRA / VENDA             |
| `entrada`    | DECIMAL(12,4) | Preço de entrada           |
| `saida`      | DECIMAL(12,4) | Preço de saída             |
| `lucro`      | DECIMAL(12,4) | Resultado da operação      |
| `estrategia` | VARCHAR(50)   | Estratégia utilizada       |

---

### Tabela `tb_trades` (existente)

| Coluna       | Tipo          | Descrição                  |
|--------------|---------------|----------------------------|
| `id`         | INT (PK, AI)  | Identificador              |
| `ativo`      | VARCHAR(20)   | Par negociado              |
| `tipo`       | VARCHAR(10)   | COMPRA / VENDA             |
| `entrada`    | DECIMAL(12,4) | Preço de entrada           |
| `quantidade` | INT           | Quantidade                 |
| `preco_atual`| DECIMAL(12,4) | Preço atual                |
| `lucro_aberto`| DECIMAL(12,4)| Lucro não realizado        |
| `estrategia` | VARCHAR(50)   | Estratégia utilizada       |

---

### Tabela `tb_lucros` (existente)

| Coluna     | Tipo          | Descrição                  |
|------------|---------------|----------------------------|
| `id`       | INT (PK, AI)  | Identificador              |
| `data`     | DATE          | Dia                        |
| `lucro`    | DECIMAL(12,4) | Lucro do dia               |
| `operacoes`| INT           | Qtd de operações no dia    |

---

## Credenciais de Login (fixas no front)

| Usuário | Senha      |
|---------|------------|
| `admin` | `admin123` |

---

## Intervalos de Atualização

| Endpoint          | Intervalo |
|-------------------|-----------|
| `/api_status.asp` | 5s        |
| `/api_leituras.asp`| 10s      |
| `/api_operacoes.asp`| 15s     |
| `/api_trades.asp` | 10s       |
| `/api_lucros.asp` | 30s       |

---

## Stack Front-end

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack React Query
- Lucide Icons
