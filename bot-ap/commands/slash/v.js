const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { tables, getConfig, getJogador, getPartidaNoThread, logPartida } = require("../../database/db");
const { sucesso, erro } = require("../../utils/embeds");
const { isMediador } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("v")
    .setDescription("Finalizar partida e declarar vencedor")
    .addUserOption(o => o.setName("vencedor").setDescription("O jogador que ganhou a partida").setRequired(true)),

  async execute(interaction) {
    const flags = MessageFlags.Ephemeral;
    await interaction.deferReply({ flags });
    const { guild, user, member, channel } = interaction;

    if (!isMediador(member, guild.id, ownerID)) {
      return interaction.editReply({ embeds: [erro("Acesso Negado", "Apenas mediadores podem finalizar partidas.")] });
    }

    const oponente = interaction.options.getUser("vencedor");
    const partida = getPartidaNoThread(channel.id);

    if (!partida) {
      return interaction.editReply({ embeds: [erro("Partida não Localizada", "Nenhuma partida ativa foi encontrada neste canal.")] });
    }

    if (![partida.criador_id, partida.oponente_id].includes(oponente.id)) {
      return interaction.editReply({ embeds: [erro("Operação Inválida", "O usuário especificado não faz parte desta partida.")] });
    }

    const perdedor_id = oponente.id === partida.criador_id ? partida.oponente_id : partida.criador_id;
    const cfg = getConfig(guild.id);
    const taxa = cfg.comissao_mediador || 0;
    const comissao = partida.valor_aposta * taxa;

    const v = getJogador(oponente.id);
    tables.jogadores.update(u => u.discord_id === oponente.id, {
      vitorias: (v.vitorias || 0) + 1,
      coins: (v.coins || 0) + (cfg.coins_por_vitoria || 0),
      consecutivo: (v.consecutivo || 0) + 1,
      ultima_partida: new Date().toISOString()
    });

    const p = getJogador(perdedor_id);
    tables.jogadores.update(u => u.discord_id === perdedor_id, {
      derrotas: (p.derrotas || 0) + 1,
      consecutivo: 0,
      ultima_partida: new Date().toISOString()
    });

    const m = tables.mediadores.find(med => med.discord_id === user.id && med.guild_id === guild.id);
    tables.mediadores.upsert(med => med.discord_id === user.id && med.guild_id === guild.id, {
      discord_id: user.id,
      guild_id: guild.id,
      partidas_mediadas: (m?.partidas_mediadas || 0) + 1,
      comissao_total: (m?.comissao_total || 0) + comissao
    });

    tables.partidas.update(pt => pt.id === partida.id, {
      status: "finalizada",
      vencedor_id: oponente.id,
      comissao_valor: comissao,
      finalizado_em: new Date().toISOString()
    });

    logPartida(guild.id, partida.id, "vencedor", user.id, "Vencedor declarado: " + oponente.id + " | Comissão: R$ " + comissao.toFixed(2));

    const resEmbed = sucesso("Partida Finalizada: Resultado", "A ordem de partida #" + partida.id + " foi encerrada com sucesso.")
      .addFields(
        { name: "Vencedor", value : "<@" + oponente.id + ">", inline: true },
        { name: "Derrotado", value : "<@" + perdedor_id + ">", inline: true },
        { name: "Mediador",  value : "<@" + user.id + ">", inline: true },
        { name: "Comissão Med.", value: "R$ " + comissao.toFixed(2), inline: false }
      );

    if (partida.thread_id) {
       const thread = await guild.channels.fetch(partida.thread_id).catch(() => null);
       if (thread) {
         await thread.send({ embeds: [resEmbed] });
         await thread.setArchived(true).catch(() => {});
       }
    }

    return interaction.editReply({ embeds: [resEmbed] });
  },
};
