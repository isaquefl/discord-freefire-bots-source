const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { tables } = require("../../database/db");
const { info, erro } = require("../../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("revanche")
    .setDescription("Solicitar revanche da última partida"),

  async execute(interaction) {
    await interaction.deferReply();
    const { guild, user } = interaction;

    const partidasUser = tables.partidas.filter(p => 
      p.guild_id === guild.id && 
      (p.criador_id === user.id || p.oponente_id === user.id) && 
      p.status === "finalizada"
    );
    partidasUser.sort((a, b) => b.id - a.id);
    const ultima = partidasUser[0];

    if (!ultima) return interaction.editReply({ embeds: [erro("Histórico Vazio", "Você não possui registros de partidas finalizadas recentemente no sistema.")] });

    const oponenteId = ultima.criador_id === user.id ? ultima.oponente_id : ultima.criador_id;

    const embed = info("Solicitação de Revanche", 
      "### Identificação do Desafio\n" +
      "<@" + user.id + "> desafia <@" + oponenteId + "> para uma revanche direta.\n\n" +
      "```\n" +
      "Partida Original : #" + ultima.id + "\n" +
      "Valor Aposta     : R$ " + Number(ultima.valor_aposta).toFixed(2) + "\n" +
      "Modo de Jogo     : " + ultima.modo + "\n" +
      "```");

    const botoes = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("revanche_aceitar_" + ultima.id + "_" + oponenteId).setLabel("Aceitar Revanche").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("revanche_recusar_" + ultima.id).setLabel("Recusar").setStyle(ButtonStyle.Danger),
    );

    return interaction.editReply({ content: "<@" + oponenteId + ">", embeds: [embed], components: [botoes] });
  },
};
