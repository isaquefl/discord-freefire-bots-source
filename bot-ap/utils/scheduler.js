const cron = require("node-cron");
const { tables, getRankingGlobal } = require("../database/db");
const { rankingEmbed } = require("./embeds");

let clientRef = null;

function iniciar(client) {
  clientRef = client;

  cron.schedule("0 20 * * *", () => enviarRankingParaTodos("diario"), { timezone: "America/Sao_Paulo" });
  cron.schedule("0 20 * * 0", () => enviarRankingParaTodos("semanal"), { timezone: "America/Sao_Paulo" });
  cron.schedule("0 20 1 * *", () => enviarRankingParaTodos("mensal"), { timezone: "America/Sao_Paulo" });

  console.log("[Cron] Agendador de Ranking Iniciado.");
}

async function enviarRankingParaTodos(periodo) {
  if (!clientRef) return;

  const guilds = tables.configuracoes.filter(c => c.canal_ranking !== null);

  for (const g of guilds) {
    try {
      const channelId = g.canal_ranking;
      const canal = await clientRef.channels.fetch(channelId).catch(() => null);
      if (!canal) continue;

      const jogadores = getRankingGlobal(g.guild_id, "vitorias", 10);
      if (!jogadores.length) continue;

      const guild  = clientRef.guilds.cache.get(g.guild_id);
      const embed = rankingEmbed(jogadores, "vitorias", guild).setTitle(`Ranking de Vitórias: ${periodo.charAt(0).toUpperCase() + periodo.slice(1)}`);

      await canal.send({ embeds: [embed] });
      console.log(`[Ranking] Ranking de vitorias enviado para #${canal.name} em ${guild.name}`);
    } catch (e) {
      console.error("[Cron] Falha no envio para guild " + (g.guild_id || "DESCONHECIDA"), e.message);
    }
  }
}

async function enviarRankingManual(canal, guildId, tipo) {
  const guild    = clientRef?.guilds.cache.get(guildId);
  const jogadores = getRankingGlobal(guildId, tipo, 10);
  if (!jogadores.length) return canal.send({ content: "Nenhum dado de ranking disponível." });
  const embed = rankingEmbed(jogadores, tipo, guild);
  return canal.send({ embeds: [embed] });
}

module.exports = { iniciar, enviarRankingManual };
