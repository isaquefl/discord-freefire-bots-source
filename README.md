# 🎲 Discord Betting Bots — Source Collection

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> ⚠️ **AVISO IMPORTANTE**
>
> Este repositório contém **APENAS CÓDIGO-FONTE** (sources) reunido para fins de **estudo e portfólio** — **não é um produto pronto para uso**. Bots de apostas podem violar os Termos de Serviço de plataformas (incluindo Discord e jogos como Free Fire) e a legislação local sobre jogos de azar. O uso é **estritamente educacional e por sua conta e risco**.

## 📖 Sobre

Esta é uma coleção de **5 bots de Discord com a mesma proposta** — mediação de apostas em partidas de **Free Fire** (X1 / 1v1 / 2v2, filas, salas e rankings) — reunidos em um único repositório e **organizados por pasta**. Cada subpasta é uma variante independente e autocontida, com sua própria estrutura de comandos, eventos e banco de dados, permitindo comparar diferentes abordagens de arquitetura para o mesmo problema.

## 📂 Variantes

| Pasta | Descrição |
|-------|-----------|
| [`aposta-ff/`](./aposta-ff) | Bot mediador de apostas Free Fire baseado em **filas**. Comandos de fila (`fila`), sistema de permissões (`permadd`, `permlist`, `permremove`) e utilitário `say`. Usa `wio.db` (JSON) como banco e `sharp`/`axios` para imagens. Inclui config de deploy para SquareCloud. |
| [`autoral-apostas/`](./autoral-apostas) | Variante **autoral** mais completa: sistema de saldo (`saldo`, `recarregarsaldo`), perfil com imagem gerada via `canvas`, mini-jogo **Mines**, painel de configuração (`botconfig`) e integração de pagamento **Pix / Mercado Pago** com geração de QR Code e servidor `express` para webhooks. Bancos: `quick.db`, `better-sqlite3` e `wio.db`. Trava de guild única (sai de servidores extras). |
| [`apostado-ff/`](./apostado-ff) | Variante **minimalista** focada em **filas 2v2**: apenas `criarFila.js` e o script `deploy-commands.js` para registro de slash commands. Ótimo ponto de partida para estudar o núcleo do fluxo de fila com discord.js puro. |
| [`hyzer-apostados/`](./hyzer-apostados) | Bot de apostas com **múltiplas filas configuráveis** (`criarFila`, `setFilas`, `delFilas`, `SetListADM`), painel administrativo (`BotConfig`, `perms`, `blacklist`, `pixadmin` para chave Pix) e sistema de **ranking** de jogadores (`ranking`, `delRanking`). Banco `wio.db`. |
| [`bot-ap/`](./bot-ap) | O **mediador mais completo** da coleção: filas e salas (`fila`, `v`, `bo`, `revanche`, `cancel`), economia com saldo e Pix/QR Code (`saldo`, `pix`, `qrcode`), **loja** (`loja`, `loja-admin`), comissão do mediador (`comissao`), eventos, painel central (`painel`, `central`), permissões, modo streamer e comandos de prefixo. Usa `better-sqlite3`, `node-cron` (tarefas agendadas) e `qrcode`. |

## 🔐 Configuração & Segurança

**Todos os segredos foram removidos deste repositório.** Isso inclui:

- 🔑 Tokens de bot do Discord
- 🗄️ Credenciais de banco de dados (MongoDB e afins)
- 🔗 URLs de webhooks e chaves de API de pagamento (Mercado Pago / Pix)

Todos os valores sensíveis foram **substituídos por placeholders** (ex.: `"SEU_VALOR_AQUI"`). Arquivos de dados de runtime (bancos JSON/SQLite populados, logs, temporários) também foram removidos.

Para rodar qualquer variante, você deve criar seu **próprio arquivo de configuração** a partir dos exemplos incluídos:

| Variante | Arquivo de exemplo | Arquivo real esperado |
|----------|--------------------|-----------------------|
| `aposta-ff` | `token.example.json` | `token.json` |
| `autoral-apostas` | `config.example.json` | `config.json` |
| `apostado-ff` | `config.example.json` | `config/config.json` |
| `hyzer-apostados` | `token.example.json` | `token.json` |
| `bot-ap` | `config.example.json` | `config.json` |

> 💡 **Nunca** faça commit de tokens ou credenciais reais. Os arquivos de configuração reais já estão listados no `.gitignore`.

## 🚀 Instalação (genérica)

Cada variante é independente. O fluxo é o mesmo para todas:

```bash
# 1. Entre na pasta da variante desejada
cd aposta-ff   # (ou autoral-apostas, apostado-ff, hyzer-apostados, bot-ap)

# 2. Instale as dependências
npm install

# 3. Crie o arquivo de configuração a partir do exemplo
#    (copie token.example.json -> token.json ou config.example.json -> config.json)
#    e preencha com seu token de bot e demais valores

# 4. Inicie o bot
node index.js
```

Requisitos: **Node.js 18+** (recomendado para discord.js v14) e um aplicativo de bot criado no [Discord Developer Portal](https://discord.com/developers/applications) com as **intents privilegiadas** habilitadas (Guild Members / Message Content, conforme a variante).

## 🛠️ Stack

- **Runtime:** Node.js (JavaScript / CommonJS)
- **Biblioteca principal:** [discord.js v14](https://discord.js.org/) (slash commands, embeds, botões, modais)
- **Bancos de dados:** `wio.db` (JSON), `quick.db`, `better-sqlite3`
- **Pagamentos:** Mercado Pago / Pix, geração de QR Code (`qrcode`, `qr-code-styling-node`)
- **Outros:** `express` (webhooks), `canvas` / `sharp` (imagens), `node-cron` (agendamento), `axios`
- **Deploy:** configs para SquareCloud e Discloud incluídas em algumas variantes

## 🗂️ Estrutura

```
discord-betting-bots-source/
├── aposta-ff/          # Filas + permissões (wio.db, SquareCloud)
├── autoral-apostas/    # Saldo, Mines, Pix/Mercado Pago, canvas
├── apostado-ff/        # Filas 2v2 minimalista
├── hyzer-apostados/    # Multi-filas, ranking, blacklist, pixadmin
├── bot-ap/             # Mediador completo: loja, comissão, eventos, cron
├── LICENSE             # MIT
└── README.md
```

Cada variante segue o padrão **handler**: `index.js` na raiz carrega comandos (`Comandos/`, `commands/`, `ComandosSlash/`) e eventos (`Eventos/`, `events/`) dinamicamente.

## 👤 Créditos

Coleção reunida, sanitizada e organizada por **Isaque Félix** ([@isaquefl](https://github.com/isaquefl)).

Os sources originais foram obtidos de projetos públicos/comunitários de bots de aposta e são mantidos aqui exclusivamente para estudo. Créditos aos autores originais de cada variante quando identificáveis (ex.: `hyzer-apostados` por "Dz7").

## 📄 Licença

Distribuído sob a licença [MIT](./LICENSE) na medida do aplicável aos arquivos desta organização. Sources de terceiros podem ter condições próprias.

---

# 🎲 Discord Betting Bots — Source Collection (English)

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> ⚠️ **IMPORTANT NOTICE**
>
> This repository contains **SOURCE CODE ONLY**, gathered for **study and portfolio purposes** — it is **not a ready-to-use product**. Betting bots may violate platform Terms of Service (including Discord and games such as Free Fire) as well as local gambling laws. Usage is **strictly educational and at your own risk**.

## 📖 About

This is a collection of **5 Discord bots sharing the same purpose** — mediating bets on **Free Fire** matches (X1 / 1v1 / 2v2, queues, match rooms and rankings) — gathered into a single repository and **organized by folder**. Each subfolder is an independent, self-contained variant with its own command/event structure and database, making it easy to compare different architectural approaches to the same problem.

## 📂 Variants

| Folder | Description |
|--------|-------------|
| [`aposta-ff/`](./aposta-ff) | **Queue-based** Free Fire betting mediator. Queue command (`fila`), permission system (`permadd`, `permlist`, `permremove`) and a `say` utility. Uses `wio.db` (JSON) as storage plus `sharp`/`axios` for images. Ships a SquareCloud deploy config. |
| [`autoral-apostas/`](./autoral-apostas) | The most feature-rich **original** variant: balance system (`saldo`, `recarregarsaldo`), `canvas`-rendered profile cards, a **Mines** mini-game, a configuration panel (`botconfig`) and **Pix / Mercado Pago** payment integration with QR Code generation and an `express` webhook server. Databases: `quick.db`, `better-sqlite3` and `wio.db`. Single-guild lock (leaves extra servers). |
| [`apostado-ff/`](./apostado-ff) | A **minimalist** variant focused on **2v2 queues**: just `criarFila.js` plus a `deploy-commands.js` script for slash-command registration. A great starting point for studying the core queue flow in plain discord.js. |
| [`hyzer-apostados/`](./hyzer-apostados) | Betting bot with **multiple configurable queues** (`criarFila`, `setFilas`, `delFilas`, `SetListADM`), an admin panel (`BotConfig`, `perms`, `blacklist`, `pixadmin` for the Pix key) and a player **ranking** system (`ranking`, `delRanking`). Storage via `wio.db`. |
| [`bot-ap/`](./bot-ap) | The **most complete mediator** in the collection: queues and match rooms (`fila`, `v`, `bo`, `revanche`, `cancel`), economy with balance and Pix/QR Code (`saldo`, `pix`, `qrcode`), a **shop** (`loja`, `loja-admin`), mediator commission (`comissao`), events, central panel (`painel`, `central`), permissions, streamer mode and prefix commands. Uses `better-sqlite3`, `node-cron` (scheduled jobs) and `qrcode`. |

## 🔐 Configuration & Security

**All secrets have been removed from this repository.** This includes:

- 🔑 Discord bot tokens
- 🗄️ Database credentials (MongoDB and similar)
- 🔗 Webhook URLs and payment API keys (Mercado Pago / Pix)

All sensitive values have been **replaced with placeholders** (e.g. `"SEU_VALOR_AQUI"` / "YOUR_VALUE_HERE"). Runtime data files (populated JSON/SQLite databases, logs, temp files) were removed as well.

To run any variant you must create your **own configuration file** from the included examples:

| Variant | Example file | Expected real file |
|---------|--------------|--------------------|
| `aposta-ff` | `token.example.json` | `token.json` |
| `autoral-apostas` | `config.example.json` | `config.json` |
| `apostado-ff` | `config.example.json` | `config/config.json` |
| `hyzer-apostados` | `token.example.json` | `token.json` |
| `bot-ap` | `config.example.json` | `config.json` |

> 💡 **Never** commit real tokens or credentials. The real configuration files are already listed in `.gitignore`.

## 🚀 Installation (generic)

Each variant is independent. The flow is the same for all of them:

```bash
# 1. Enter the desired variant folder
cd aposta-ff   # (or autoral-apostas, apostado-ff, hyzer-apostados, bot-ap)

# 2. Install dependencies
npm install

# 3. Create the configuration file from the example
#    (copy token.example.json -> token.json or config.example.json -> config.json)
#    and fill in your bot token and other values

# 4. Start the bot
node index.js
```

Requirements: **Node.js 18+** (recommended for discord.js v14) and a bot application created on the [Discord Developer Portal](https://discord.com/developers/applications) with the required **privileged intents** enabled (Guild Members / Message Content, depending on the variant).

## 🛠️ Stack

- **Runtime:** Node.js (JavaScript / CommonJS)
- **Core library:** [discord.js v14](https://discord.js.org/) (slash commands, embeds, buttons, modals)
- **Databases:** `wio.db` (JSON), `quick.db`, `better-sqlite3`
- **Payments:** Mercado Pago / Pix, QR Code generation (`qrcode`, `qr-code-styling-node`)
- **Other:** `express` (webhooks), `canvas` / `sharp` (image rendering), `node-cron` (scheduling), `axios`
- **Deploy:** SquareCloud and Discloud configs included in some variants

## 🗂️ Structure

```
discord-betting-bots-source/
├── aposta-ff/          # Queues + permissions (wio.db, SquareCloud)
├── autoral-apostas/    # Balance, Mines, Pix/Mercado Pago, canvas
├── apostado-ff/        # Minimalist 2v2 queues
├── hyzer-apostados/    # Multi-queue, ranking, blacklist, pixadmin
├── bot-ap/             # Full mediator: shop, commission, events, cron
├── LICENSE             # MIT
└── README.md
```

Each variant follows a **handler** pattern: a root `index.js` dynamically loads commands (`Comandos/`, `commands/`, `ComandosSlash/`) and events (`Eventos/`, `events/`).

## 👤 Credits

Collection gathered, sanitized and organized by **Isaque Félix** ([@isaquefl](https://github.com/isaquefl)).

The original sources come from public/community betting-bot projects and are kept here exclusively for study. Credit goes to the original authors of each variant where identifiable (e.g. `hyzer-apostados` by "Dz7").

## 📄 License

Distributed under the [MIT](./LICENSE) license to the extent applicable to the organization of this repository. Third-party sources may carry their own terms.
