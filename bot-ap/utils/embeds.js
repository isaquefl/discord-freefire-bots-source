const { EmbedBuilder } = require("discord.js");

const COR = {
  principal : 0x2B2D31,
  sucesso   : 0x2ECC71,
  erro      : 0xE74C3C,
  aviso     : 0xF1C40F,
  info      : 0x3498DB,
  ouro      : 0xD4AF37,
  roxo      : 0x8E44AD,
  laranja   : 0xD35400,
  dark      : 0x0F0F0F
};

function base(cor) { 
  return new EmbedBuilder()
    .setColor(cor || COR.principal)
    .setTimestamp()
    .setFooter({ text: "Sistema Apostado: Security Layer" });
}

const erro    = (t, d) => base(COR.erro).setTitle("Erro: " + t).setDescription(d || "Ocorreu um problema inesperado.");
const sucesso = (t, d) => base(COR.sucesso).setTitle(t).setDescription(d || "Operação realizada com sucesso.");
const info    = (t, d) => base(COR.info).setTitle(t).setDescription(d || "Informação do sistema.");
const aviso   = (t, d) => base(COR.aviso).setTitle("Aviso: " + t).setDescription(d || "Atenção necessária.");

function perfil(jogador, member) {
  const vitorias  = jogador.vitorias  || 0;
  const derrotas  = jogador.derrotas  || 0;
  const consec    = jogador.consecutivo    || 0;
  const streak    = jogador.streak_diaria  || 0;
  const total     = vitorias + derrotas;
  const wr        = total > 0 ? ((vitorias / total) * 100).toFixed(1) : "0.0";

  const barLen = 14;
  const filled = total > 0 ? Math.round((vitorias / total) * barLen) : 0;
  const wrBar  = "█".repeat(filled) + "░".repeat(barLen - filled);

  return new EmbedBuilder()
    .setColor(COR.ouro)
    .setAuthor({ name: "Perfil de " + member.displayName, iconURL: member.displayAvatarURL({ dynamic: true }) })
    .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 256 }))
    .addFields(
      { name: "Estatísticas de Pontos", value: "\u200B", inline: false },
      { name: "Vitórias", value: "**" + vitorias + "**", inline: true },
      { name: "Derrotas", value: "**" + derrotas + "**", inline: true },
      { name: "\u200B", value: "\u200B", inline: true },
      { name: "Consecutivas", value: "**" + consec + "**", inline: true },
      { name: "Streak Diária", value: "**" + streak + "**", inline: true },
      { name: "\u200B", value: "\u200B", inline: true },
      { name: "Partidas Totais", value: "**" + total + "**", inline: false },
      { name: "Taxa de Vitória", value: "`" + wrBar + "` " + wr + "%", inline: false }
    )
    .setFooter({ text: "Sistema Apostado VIP" })
    .setTimestamp();
}

function partidaEmbed(p, criadorTag, oponenteTag, filaInfo) {
  return base(COR.principal)
    .setTitle("Ordem de Partida #" + p.id)
    .addFields(
      { name: "Detalhes do Conflito", value: "**Jogo:** " + (filaInfo?.jogo || "Free Fire") + "\n**Modo:** " + (p.modo || "Ranked"), inline: false },
      { name: "Desafiante", value: "<@" + p.criador_id + ">", inline: true },
      { name: "Oponente",   value: p.oponente_id ? "<@" + p.oponente_id + ">" : "Aguardando...", inline: true },
      { name: "Aposta",     value: "Valor R$ " + Number(p.valor_aposta).toFixed(2), inline: true },
      { name: "Status Atual", value: "Aguardando Mediação", inline: false }
    );
}

function rankingEmbed(jogadores, tipo, guild) {
  const titulos = { vitorias: "Ranking de Vitórias", derrotas: "Ranking de Derrotas", coins: "Ranking de Coins" };
  const linhas = jogadores.map((j, i) => {
    const pos = (i + 1).toString().padStart(2, "0");
    const valor = tipo === "coins" ? "R$ " + j[tipo].toLocaleString("pt-BR") : j[tipo];
    return "`" + pos + ".` <@" + j.discord_id + ">: **" + valor + "**";
  });

  return base(COR.ouro)
    .setTitle(titulos[tipo] || "Ranking Geral")
    .setDescription(linhas.length ? linhas.join("\n") : "Sem dados registrados")
    .setFooter({ text: "Guilda: " + (guild?.name || "Sistema") + " | Sincronizado" });
}

function caixaAbrindo(caixa) {
  return base(parseInt((caixa.cor || "#D4AF37").replace("#", ""), 16) || COR.ouro)
    .setTitle("Operação: Abertura de Caixa")
    .setDescription("### Identificando conteúdo...\n" + "```\n" + (caixa.nome || "Caixa") + "\n```")
    .setImage(caixa.gif_url || null);
}

function caixaResultado(caixa, item) {
  const cores = { lendario: 0xFFD700, epico: 0x9B59B6, raro: 0x3498DB, incomum: 0x2ECC71, comum: 0xBDC3C7 };
  return base(cores[item.raridade] || COR.ouro)
    .setTitle("Resultado da Operação")
    .setDescription(
      "### Item Adquirido\n" +
      "# " + (item.nome || "Item") + "\n" +
      (item.descricao || "Sem descrição disponível.") + "\n\n" +
      "**Raridade:** \"" + (item.raridade || "Comum").toUpperCase() + "\""
    );
}

function gerarBarra(wins, total, n) {
  n = n || 20;
  const CHEIO = "█", VAZIO = "░";
  if (total === 0) return "`[" + VAZIO.repeat(n) + "]` 0.0%";
  const ok = Math.round((wins / total) * n);
  const pct = ((wins / total) * 100).toFixed(1);
  return "`" + CHEIO.repeat(ok) + VAZIO.repeat(n - ok) + " " + pct + "%`";
}

function centralConfig(guild, categoria, campos) {
  const embed = base(COR.roxo)
    .setAuthor({ name: "Painel de Configuração Central: " + guild.name, iconURL: guild.iconURL({ dynamic: true }) })
    .setTitle("Módulo Ativo: " + categoria)
    .setDescription("Utilize os campos abaixo para parametrizar o comportamento do sistema. Alterações são aplicadas em tempo real.");

  if (campos && campos.length) {
    embed.addFields(campos);
  } else {
    embed.addFields({ name: "Aguardando Seleção", value: "Selecione uma categoria no menu abaixo para gerenciar as configurações específicas." });
  }

  return embed;
}

function formatCurrency(valor, nomeMoeda = "Coins") {
  return valor.toLocaleString("pt-BR") + " " + nomeMoeda;
}

module.exports = { COR, base, erro, sucesso, info, aviso, perfil, partidaEmbed, rankingEmbed, caixaAbrindo, caixaResultado, gerarBarra, centralConfig, formatCurrency };
