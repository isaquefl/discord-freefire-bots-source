const fs = require("fs");
const path = require("path");

class JsonTable {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(__dirname, "json", `${name}.json`);
    this.data = [];
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(path.dirname(this.filePath))) {
        fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
      } else {
        this.save();
      }
    } catch (e) {
      console.error("[DB] Erro ao carregar tabela " + this.name + ":", e);
      this.data = [];
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error("[DB] Erro ao salvar tabela " + this.name + ":", e);
    }
  }

  all() {
    return this.data;
  }

  find(predicate) {
    return this.data.find(predicate);
  }

  filter(predicate) {
    return this.data.filter(predicate);
  }

  insert(item) {
    if (!item.id) {
       const maxId = this.data.reduce((max, i) => Math.max(max, i.id || 0), 0);
       item.id = maxId + 1;
    }
    this.data.push(item);
    this.save();
    return item;
  }

  update(predicate, updates) {
    const items = this.filter(predicate);
    items.forEach(item => {
      Object.assign(item, updates);
    });
    if (items.length > 0) this.save();
    return items;
  }

  upsert(predicate, item) {
    const existing = this.find(predicate);
    if (existing) {
       Object.assign(existing, item);
       this.save();
       return existing;
    }
    return this.insert(item);
  }

  delete(predicate) {
    const initialLength = this.data.length;
    this.data = this.data.filter(item => !predicate(item));
    if (this.data.length !== initialLength) this.save();
  }
}

const tables = {
  jogadores: new JsonTable("jogadores"),
  filas: new JsonTable("filas"),
  partidas: new JsonTable("partidas"),
  mediadores: new JsonTable("mediadores"),
  mediadores_contas: new JsonTable("mediadores_contas"),
  fila_mediadores: new JsonTable("fila_mediadores"),
  configuracoes: new JsonTable("configuracoes"),
  permissoes: new JsonTable("permissoes"),
  itens_loja: new JsonTable("itens_loja"),
  inventario: new JsonTable("inventario"),
  caixas: new JsonTable("caixas"),
  caixas_itens: new JsonTable("caixas_itens"),
  eventos: new JsonTable("eventos"),
  bo_analises: new JsonTable("bo_analises"),
  transacoes: new JsonTable("transacoes"),
  logs_partidas: new JsonTable("logs_partidas"),
  modos_partida: new JsonTable("modos_partida"),
  jogos: new JsonTable("jogos"),
};

function getJogador(discordId) {
  let j = tables.jogadores.find(j => j.discord_id === discordId);
  if (!j) {
    j = tables.jogadores.insert({
      discord_id: discordId,
      nome_ff: null,
      uid_ff: null,
      vitorias: 0,
      derrotas: 0,
      coins: 0,
      consecutivo: 0,
      streak_diaria: 0,
      ultima_partida_data: null,
      pix: null,
      criado_em: new Date().toISOString()
    });
  }
  return j;
}

function getConfig(guildId) {
  let c = tables.configuracoes.find(c => c.guild_id === guildId);
  if (!c) {
    c = tables.configuracoes.insert({
       guild_id: guildId,
       canal_logs: null,
       canal_ranking: null,
       canal_bo: null,
       cargo_mediador: null,
       cargo_admin: null,
       prefix: "!",
       coins_por_vitoria: 10,
       comissao_mediador: 0.05,
       distribuicao_modo: "1x1",
       permitir_pix_med: 1,
       qrcode_padrao: null,
       ranking_diario: "20:00",
       ranking_semanal: "sunday",
       ranking_mensal: 1,
       streamer_modo: "basico",
       fila_padrao: null,
       canal_painel: null,
       regras_texto: "Sem regras configuradas no momento.",
       nome_moeda: "Coins",
       pix_frame_url: null,
       pix_gp_url: null,
       taxa_sala: 0,
       taxa_mediacao_fixa: 0,
       limite_filas_mediador: 5,
       mediador_pix_autonomo: 1,
       distribuicao_fila: "1por1",
       ui_tipo: "botao",
       streamer_live_url: null,
       streamer_regras: null,
       streamer_canal_nome: "contra • [[nome_streamer]]",
       cargo_analista: null,
       cargo_streamer_mediador: null
    });
  }
  return c;
}

function updateConfig(guildId, campos) {
  tables.configuracoes.update(c => c.guild_id === guildId, campos);
}

function getPartidaAtiva(userId, guildId) {
  return tables.partidas.find(p => 
    p.guild_id === guildId && 
    ["aguardando", "em_andamento"].includes(p.status) && 
    (p.criador_id === userId || p.oponente_id === userId)
  );
}

function getPartidaNoThread(threadId) {
  return tables.partidas.find(p => p.thread_id === threadId && ["aguardando", "em_andamento"].includes(p.status));
}

function adicionarCoins(discordId, guildId, valor, descricao) {
  getJogador(discordId);
  tables.jogadores.update(j => j.discord_id === discordId, {
    coins: (tables.jogadores.find(j => j.discord_id === discordId)?.coins || 0) + valor
  });
  tables.transacoes.insert({
    discord_id: discordId,
    guild_id: guildId,
    tipo: valor > 0 ? "ganho" : "gasto",
    valor: Math.abs(valor),
    descricao: descricao,
    criado_em: new Date().toISOString()
  });
}

function proximoMediador(guildId, filaId, modo) {
  if (modo === "equilibrado") {
    const activeMedIds = tables.partidas.filter(p => p.guild_id === guildId && p.status === "em_andamento").map(p => p.mediador_id);
    const countMap = {};
    activeMedIds.forEach(id => countMap[id] = (countMap[id] || 0) + 1);

    const meds = tables.mediadores.filter(m => m.guild_id === guildId && m.ativo === 1);
    if (!meds.length) return null;

    meds.sort((a, b) => {
       const cntA = countMap[a.discord_id] || 0;
       const cntB = countMap[b.discord_id] || 0;
       if (cntA !== cntB) return cntA - cntB;
       return (a.partidas_mediadas || 0) - (b.partidas_mediadas || 0);
    });
    return meds[0].discord_id;
  }

  const partidasFila = tables.partidas.filter(p => p.guild_id === guildId && p.fila_id == filaId && ["em_andamento", "finalizada"].includes(p.status));
  partidasFila.sort((a, b) => (b.id || 0) - (a.id || 0));
  const ultimo = partidasFila[0];

  const todos = tables.mediadores.filter(m => m.guild_id === guildId && m.ativo === 1);
  todos.sort((a, b) => (a.id || 0) - (b.id || 0));

  if (!todos.length) return null;
  if (!ultimo) return todos[0].discord_id;

  const idx = todos.findIndex(m => m.discord_id === ultimo.mediador_id);
  return todos[(idx + 1) % todos.length].discord_id;
}

function getRankingGlobal(guildId, tipo, limite = 10) {
  const col = ["vitorias", "derrotas", "coins"].includes(tipo) ? tipo : "vitorias";
  
  const matchPlayers = new Set();
  tables.partidas.filter(p => p.guild_id === guildId).forEach(p => {
    matchPlayers.add(p.criador_id);
    if (p.oponente_id) matchPlayers.add(p.oponente_id);
  });

  const players = tables.jogadores.filter(j => matchPlayers.has(j.discord_id) && j[col] > 0);
  players.sort((a, b) => (b[col] || 0) - (a[col] || 0));
  return players.slice(0, limite);
}

function logPartida(guildId, partidaId, tipo, autorId, conteudo) {
  tables.logs_partidas.insert({
    guild_id: guildId,
    partida_id: partidaId,
    tipo: tipo,
    autor_id: autorId,
    conteudo: conteudo,
    criado_em: new Date().toISOString()
  });
}

const dbCompatibility = {
  prepare: (sql) => {
    console.warn("[DB] Chamada SQL detectada (pode falhar): " + sql);
    return {
      get: () => null,
      all: () => [],
      run: () => ({ changes: 0, lastInsertRowid: 0 })
    };
  }
};

module.exports = {
  db: dbCompatibility,
  tables,
  getJogador,
  getConfig,
  updateConfig,
  getPartidaAtiva,
  getPartidaNoThread,
  adicionarCoins,
  proximoMediador,
  getRankingGlobal,
  logPartida,
};