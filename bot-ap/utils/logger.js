const fs   = require("fs");
const path = require("path");
const { tables } = require("../database/db");

const LOGS_DIR = path.join(__dirname, "..", "logs");
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function guildDir(guildId) {
  const d = path.join(LOGS_DIR, guildId);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

function salvarLogTXT(partida, entradas) {
  const dir  = guildDir(partida.guild_id);
  const file = path.join(dir, "partida_" + partida.id + ".txt");

  const linhas = [
    "Registro de Partida: Sistema Apostado VIP",
    "",
    "ID da Partida  : #" + partida.id,
    "ID Criador     : " + partida.criador_id,
    "ID Oponente    : " + (partida.oponente_id || "N/A"),
    "ID Mediador    : " + (partida.mediador_id || "N/A"),
    "Valor Aposta   : R$ " + Number(partida.valor_aposta).toFixed(2),
    "Modo de Jogo   : " + (partida.modo || "Ranked"),
    "Status Final   : " + partida.status,
    "ID Vencedor    : " + (partida.vencedor_id || "N/A"),
    "Data Início    : " + (partida.criado_em || ""),
    "Data Finaliz   : " + (partida.finalizado_em || "N/A"),
    "",
    "Histórico de Operações:",
    "",
    ...(entradas || []).map(e => "[" + e.criado_em + "] [" + e.tipo + "] " + (e.conteudo || "")),
    "",
    "Fim do Registro",
  ];

  fs.writeFileSync(file, linhas.join("\n"), "utf8");
  return file;
}

function gerarTranscriptHTML(partida, entradas, membros) {
  const dir  = guildDir(partida.guild_id);
  const file = path.join(dir, "transcript_" + partida.id + ".html");

  const linhasHtml = (entradas || []).map(e => {
    const autor = membros?.[e.autor_id] || e.autor_id || "Sistema";
    return `<div class="entry ${e.tipo}"><span class="time">${e.criado_em}</span><span class="type tag-${e.tipo}">${e.tipo}</span><span class="author">${htmlEscape(autor)}</span><span class="content">${htmlEscape(e.conteudo || "")}</span></div>`;
  }).join("\n");

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Transcript Partida #${partida.id}</title><style>body { background:#0f0f0f; color:#ffffff; font-family:monospace; padding:40px; margin:0; line-height:1.6; } h1 { color:#d4af37; border-bottom:1px solid #333; padding-bottom:10px; font-size:24px; text-transform:uppercase; } .meta { background:#151515; border:1px solid #333; padding:20px; margin-bottom:30px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; } .meta-item label { color:#888; font-size:10px; text-transform:uppercase; display:block; margin-bottom:5px; } .meta-item span { font-weight:bold; font-size:14px; color:#d4af37; } .log-container { border-left:1px solid #333; padding-left:20px; } .entry { margin-bottom:15px; } .time { color:#555; font-size:11px; margin-right:15px; } .type { font-size:10px; border:1px solid #333; padding:2px 6px; margin-right:15px; text-transform:uppercase; } .tag-vencedor { color:#d4af37; border-color:#d4af37; } .author { font-weight:bold; margin-right:15px; color:#aaa; } .content { color:#eee; } .winner-banner { background:#d4af37; color:#000; padding:15px; text-align:center; margin-bottom:30px; font-weight:bold; text-transform:uppercase; letter-spacing:2px; }</style></head><body><h1>Registro de Partida: #${partida.id}</h1>${partida.vencedor_id ? `<div class="winner-banner">Vencedor Identificado: ${htmlEscape(membros?.[partida.vencedor_id] || partida.vencedor_id)}</div>` : ""}<div class="meta"><div class="meta-item"><label>Desafiante</label><span>${htmlEscape(membros?.[partida.criador_id] || partida.criador_id)}</span></div><div class="meta-item"><label>Oponente</label><span>${partida.oponente_id ? htmlEscape(membros?.[partida.oponente_id] || partida.oponente_id) : "N/A"}</span></div><div class="meta-item"><label>Mediador</label><span>${partida.mediador_id ? htmlEscape(membros?.[partida.mediador_id] || partida.mediador_id) : "N/A"}</span></div><div class="meta-item"><label>Valor</label><span>R$ ${Number(partida.valor_aposta).toFixed(2)}</span></div><div class="meta-item"><label>Modo</label><span>${htmlEscape(partida.modo || "Ranked")}</span></div><div class="meta-item"><label>Status</label><span>${htmlEscape(partida.status)}</span></div></div><div class="log-container">${linhasHtml}</div></body></html>`;

  fs.writeFileSync(file, html, "utf8");
  return file;
}

function htmlEscape(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function getLogsPartida(partidaId) {
  const logs = tables.logs_partidas.filter(l => l.partida_id === partidaId);
  logs.sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em));
  return logs;
}

module.exports = { salvarLogTXT, gerarTranscriptHTML, getLogsPartida };
