# Trade Bot — Documentação Técnica

## Visão Geral

Sistema front-end para monitoramento em tempo real de um robô de trading (SOL/USDT).

**URL base:** `datebook.com.br/trading_bot/`

**APIs ficam em:** `datebook.com.br/trading_bot/api/`

---

## Páginas

| Rota                             | Descrição                                       |
|----------------------------------|-------------------------------------------------|
| `/trading_bot/login`             | Formulário de login                             |
| `/trading_bot/`                  | Dashboard — status do robô + leituras de mercado|
| `/trading_bot/monitoramento`     | Monitoramento de pares SOLUSDT vs SOLUSDC       |
| `/trading_bot/operacoes`         | Operações realizadas                            |
| `/trading_bot/lucros`            | Lucro diário acumulado                          |
| `/trading_bot/configuracao`      | Configuração remota do robô                     |

---

## Credenciais de Login

| Usuário      | Senha      |
|--------------|------------|
| `Alessandro` | `Ale@1970` |

---

## APIs Consumidas

### 1. `GET /trading_bot/api/api_status.asp` — Status do Robô

Atualização a cada **5 segundos**.

```json
{
  "status": "OPERANTE",
  "estado": "COMPRADO",
  "ultimo_batimento": "2026-03-02T14:30:15",
  "ip": "189.40.72.15",
  "ip_anterior": "189.40.70.200",
  "nome_robo": "SOL Trading Bot v2"
}
```

| Campo              | Tipo   | Valores possíveis        | Descrição                                  |
|--------------------|--------|--------------------------|--------------------------------------------|
| `status`           | string | `OPERANTE`, `INOPERANTE` | Se o robô está ativo                       |
| `estado`           | string | `COMPRADO`, `VENDIDO`    | Posição atual do robô                      |
| `ultimo_batimento` | string | ISO 8601 datetime        | Última vez que o robô respondeu            |
| `ip`               | string | Endereço IPv4            | IP atual da máquina do robô (com botão copiar) |
| `ip_anterior`      | string | Endereço IPv4            | IP anterior para comparação visual         |
| `nome_robo`        | string | Texto livre              | Nome do robô em operação (exibido no card) |

---

### 2. `GET /trading_bot/api/api_leituras.asp` — Leituras de Mercado

Atualização a cada **10 segundos**. Exibe as **50 primeiras** (mais recentes no topo).

```json
[
  {
    "data_hora": "2026-03-02 14:30:00",
    "preco": 142.5312,
    "mm7": 141.8900,
    "mm40": 140.2100,
    "estado": "COMPRADO"
  }
]
```

| Campo      | Tipo   | Descrição                              |
|------------|--------|----------------------------------------|
| `data_hora`| string | Data e hora da leitura                 |
| `preco`    | number | Preço atual de SOL/USDT                |
| `mm7`      | number | Média Móvel de 7 períodos              |
| `mm40`     | number | Média Móvel de 40 períodos             |
| `estado`   | string | Estado naquele momento (COMPRADO/VENDIDO) |

---

### 3. `GET /trading_bot/api/api_operacoes.asp` — Operações Realizadas

Atualização a cada **15 segundos**.

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

### 4. `GET /trading_bot/api/api_trades.asp` — Trades Abertos

Atualização a cada **10 segundos**.

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

### 5. `GET /trading_bot/api/api_lucros.asp` — Lucros Diários

Atualização a cada **30 segundos**.

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

### 6. `GET /trading_bot/api/api_monitor.asp` — Monitoramento de Pares

Atualização a cada **30 segundos**. Retorna registros de monitoramento dos pares SOLUSDT e SOLUSDC.

```json
[
  {
    "data_hora": "2026-03-05T14:30:00",
    "simbolo": "SOLUSDT",
    "preco": 142.5312,
    "bid": 142.5200,
    "ask": 142.5400,
    "spread_percent": 0.0140,
    "range_percent": 0.3200,
    "volume": 125000,
    "taxa_percent": 0.0750
  }
]
```

| Campo            | Tipo   | Descrição                                |
|------------------|--------|------------------------------------------|
| `data_hora`      | string | Timestamp da leitura                     |
| `simbolo`        | string | Par monitorado (`SOLUSDT` ou `SOLUSDC`)  |
| `preco`          | number | Último preço                             |
| `bid`            | number | Melhor bid                               |
| `ask`            | number | Melhor ask                               |
| `spread_percent` | number | Spread em %                              |
| `range_percent`  | number | Range do candle em %                     |
| `volume`         | number | Volume negociado                         |
| `taxa_percent`   | number | Taxa em %                                |

> **Custo total estimado** = `spread_percent + taxa_percent` (calculado no front-end).

> **Destaques visuais:** par com menor custo total → verde; par com maior spread → vermelho.

---

### 7. `GET /trading_bot/api/api_config.asp?symbol=SOLUSDT` — Configuração do Robô

Retorna a configuração atual do par selecionado.

```json
{
  "id": 1,
  "symbol": "SOLUSDT",
  "candle_duplo_compra_ativo": true,
  "candle_duplo_venda_ativo": false,
  "intrabar_compra_ativo": true,
  "intrabar_venda_ativo": false,
  "intrabar_percentual_compra": 0.0050,
  "intrabar_percentual_venda": 0.0030,
  "mean_reversao_ativo": true,
  "mean_reversao_percentual_entrada": 0.25,
  "mean_reversao_percentual_alvo": 0.50,
  "valor_operacao": 100.00,
  "bot_ativo": true,
  "updated_at": "2026-03-02T14:30:15"
}
```

---

### 8. `POST /trading_bot/api/api_config_save.asp` — Salvar Configuração

Recebe JSON com a configuração atualizada. Atualiza ou insere (upsert por `symbol`).

**Request body:**

```json
{
  "symbol": "SOLUSDT",
  "candle_duplo_compra_ativo": true,
  "candle_duplo_venda_ativo": false,
  "intrabar_compra_ativo": true,
  "intrabar_venda_ativo": false,
  "intrabar_percentual_compra": 0.0050,
  "intrabar_percentual_venda": 0.0030,
  "mean_reversao_ativo": true,
  "mean_reversao_percentual_entrada": 0.25,
  "mean_reversao_percentual_alvo": 0.50,
  "valor_operacao": 100.00,
  "bot_ativo": true
}
```

**Response:** Retorna o registro atualizado (mesmo formato do GET).

---

## Banco de Dados (Backend)

### Tabela `tb_status_robo`

| Coluna             | Tipo         | Descrição                     |
|--------------------|--------------|-------------------------------|
| `id`               | INT (PK)     | Identificador                 |
| `status`           | VARCHAR(20)  | OPERANTE / INOPERANTE         |
| `estado`           | VARCHAR(20)  | COMPRADO / VENDIDO            |
| `ultimo_batimento` | DATETIME     | Timestamp do último heartbeat |
| `ip`               | VARCHAR(45)  | IP atual da máquina do robô   |
| `ip_anterior`      | VARCHAR(45)  | IP anterior para comparação   |
| `nome_robo`        | VARCHAR(100) | Nome do robô em operação      |

> Registro único, sempre atualizado pelo robô.

---

### Tabela `tb_leituras`

| Coluna      | Tipo          | Descrição                     |
|-------------|---------------|-------------------------------|
| `id`        | INT (PK, AI)  | Identificador auto-incremento |
| `data_hora` | DATETIME      | Momento da leitura            |
| `preco`     | DECIMAL(12,4) | Preço SOL/USDT                |
| `mm7`       | DECIMAL(12,4) | Média Móvel 7                 |
| `mm40`      | DECIMAL(12,4) | Média Móvel 40                |
| `estado`    | VARCHAR(20)   | COMPRADO / VENDIDO            |

---

### Tabela `tb_operacoes`

| Coluna       | Tipo          | Descrição            |
|--------------|---------------|----------------------|
| `id`         | INT (PK, AI)  | Identificador        |
| `data`       | DATE          | Data da operação     |
| `ativo`      | VARCHAR(20)   | Par negociado        |
| `tipo`       | VARCHAR(10)   | COMPRA / VENDA       |
| `entrada`    | DECIMAL(12,4) | Preço de entrada     |
| `saida`      | DECIMAL(12,4) | Preço de saída       |
| `lucro`      | DECIMAL(12,4) | Resultado             |
| `estrategia` | VARCHAR(50)   | Estratégia utilizada |

---

### Tabela `tb_trades`

| Coluna        | Tipo          | Descrição            |
|---------------|---------------|----------------------|
| `id`          | INT (PK, AI)  | Identificador        |
| `ativo`       | VARCHAR(20)   | Par negociado        |
| `tipo`        | VARCHAR(10)   | COMPRA / VENDA       |
| `entrada`     | DECIMAL(12,4) | Preço de entrada     |
| `quantidade`  | INT           | Quantidade           |
| `preco_atual` | DECIMAL(12,4) | Preço atual          |
| `lucro_aberto`| DECIMAL(12,4) | Lucro não realizado  |
| `estrategia`  | VARCHAR(50)   | Estratégia utilizada |

---

### Tabela `tb_lucros`

| Coluna     | Tipo          | Descrição              |
|------------|---------------|------------------------|
| `id`       | INT (PK, AI)  | Identificador          |
| `data`     | DATE          | Dia                    |
| `lucro`    | DECIMAL(12,4) | Lucro do dia           |
| `operacoes`| INT           | Qtd de operações no dia|

---

### Tabela `bot_config` *(NOVA)*

| Coluna                       | Tipo          | Descrição                          |
|------------------------------|---------------|------------------------------------|
| `id`                         | INT (PK, AI)  | Identificador                      |
| `symbol`                         | VARCHAR(20)   | Par (SOLUSDT, ETHUSDT) — UNIQUE    |
| `candle_duplo_compra_ativo`      | BIT           | Estratégia candle duplo compra     |
| `candle_duplo_venda_ativo`       | BIT           | Estratégia candle duplo venda      |
| `intrabar_compra_ativo`          | BIT           | Estratégia intrabar compra         |
| `intrabar_venda_ativo`           | BIT           | Estratégia intrabar venda          |
| `intrabar_percentual_compra`     | DECIMAL(5,4)  | % intrabar compra (ex: 0.0050)     |
| `intrabar_percentual_venda`      | DECIMAL(5,4)  | % intrabar venda (ex: 0.0030)      |
| `mean_reversao_ativo`            | BIT           | Estratégia Mean Reversão           |
| `mean_reversao_percentual_entrada` | DECIMAL(5,2) | % entrada no range               |
| `mean_reversao_percentual_alvo`  | DECIMAL(5,2)  | % preço alvo                       |
| `valor_operacao`                 | DECIMAL(10,2) | Valor por operação em USDT         |
| `bot_ativo`                      | BIT           | Start (1) / Pause (0)             |
| `updated_at`                     | DATETIME      | Auto-atualizado ao salvar          |

> Cada `symbol` possui apenas um registro (constraint UNIQUE).

**SQL de criação:**

```sql
CREATE TABLE bot_config (
  id INT IDENTITY(1,1) PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  candle_duplo_compra_ativo BIT DEFAULT 0,
  candle_duplo_venda_ativo BIT DEFAULT 0,
  intrabar_compra_ativo BIT DEFAULT 0,
  intrabar_venda_ativo BIT DEFAULT 0,
  intrabar_percentual_compra DECIMAL(5,4) DEFAULT 0,
  intrabar_percentual_venda DECIMAL(5,4) DEFAULT 0,
  mean_reversao_ativo BIT DEFAULT 0,
  mean_reversao_percentual_entrada DECIMAL(5,2) DEFAULT 0,
  mean_reversao_percentual_alvo DECIMAL(5,2) DEFAULT 0,
  valor_operacao DECIMAL(10,2) DEFAULT 0,
  bot_ativo BIT DEFAULT 0,
  updated_at DATETIME DEFAULT GETDATE()
);
```

---

## Intervalos de Atualização

| Endpoint                              | Intervalo   |
|---------------------------------------|-------------|
| `/trading_bot/api/api_status.asp`     | 5s          |
| `/trading_bot/api/api_leituras.asp`   | 10s         |
| `/trading_bot/api/api_operacoes.asp`  | 15s         |
| `/trading_bot/api/api_trades.asp`     | 10s         |
| `/trading_bot/api/api_lucros.asp`     | 30s         |
| `/trading_bot/api/api_monitor.asp`    | 30s         |
| `/trading_bot/api/api_config.asp`     | sob demanda |
| `/trading_bot/api/api_config_save.asp`| sob demanda |

---

## Stack Front-end

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack React Query
- Lucide Icons
