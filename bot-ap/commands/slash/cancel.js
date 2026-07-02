const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { tables, getPartidaAtiva, getPartidaNoThread, logPartida } = require("../../database/db");
const { sucesso, erro } = require("../../utils/embeds");
const { isMediador }    = require("../../utils/permissions");
const { ownerID }       = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cancel")
    .setDescription("Cancela a partida ativa"),

  async execute(interaction) {
    await interaction.deferReply();
    const { guild, user, member, channel } = interaction;

    let partida = getPartidaAtiva(user.id, guild.id) || getPartidaNoThread(channel.id);

    if (!partida && isMediador(member, guild.id, ownerID)) {
      partida = tables.partidas.find(p => p.guild_id === guild.id && ["aguardando", "em_andamento"].includes(p.status));
    }

    if (!partida) {
      return interaction.editReply({ embeds: [erro("Operação Inválida", "Não há partida ativa nos seus registros para cancelamento.")] });
    }

    const oponenteId = partida.criador_id === user.id ? (partida.oponente_id || null) : partida.criador_id;
    if (!oponenteId) {
       tables.partidas.update(p => p.id === partida.id, { status: "cancelada" });
       return interaction.editReply({ embeds: [sucesso("Partida Cancelada", "A partida foi cancelada automaticamente pois não havia oponente.")] });
    }

    const embed = info("Solicitação de Cancelamento", 
      "### Protocolo de Segurança\n" +
      "<@" + user.id + "> deseja cancelar a partida `#" + partida.id + "`. <@" + oponenteId + ">, você aceita o cancelamento?")
      .addFields({ name: "Detalhes da Aposta", value: "```\nValor: R$ " + Number(partida.valor_aposta).toFixed(2) + "\n```", inline: false });

    tables.partidas.update(p => p.id === partida.id, {
      status: "cancelada",
      finalizado_em: new Date().toISOString()
    });
    logPartida(guild.id, partida.id, "cancelado", user.id, "Partida cancelada por " + user.id);

    if (partida.mensagem_id) channel.messages.fetch(partida.mensagem_id).then(m => m.edit({ components: [] })).catch(() => {});
    if (partida.thread_id)   guild.channels.fetch(partida.thread_id).then(t => t.setArchived(true)).catch(() => {});

    return interaction.editReply({ embeds: [sucesso("Execução Concluída", "A ordem de partida `#" + partida.id + "` foi devidamente cancelada no sistema.")] });
  },
};
