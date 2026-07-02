const { SlashCommandBuilder } = require("discord.js");
const { getJogador } = require("../../database/db");
const { base, COR } = require("../../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("Ver saldo de coins de um jogador")
    .addUserOption(o => o.setName("usuario").setDescription("Usuário (deixe vazio para ver o seu)").setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const alvo   = interaction.options.getUser("usuario") || interaction.user;
    const member = interaction.guild.members.cache.get(alvo.id);
    const j = getJogador(alvo.id);
    const embed = base(COR.ouro)
      .setAuthor({ name: "Carteira Digital: " + (member?.displayName || alvo.username), iconURL: member?.displayAvatarURL({ dynamic: true }) || alvo.displayAvatarURL() })
      .addFields(
        { name: "Saldo Disponível", value: "```\nR$ " + (j.coins || 0).toLocaleString("pt-BR") + "\n```", inline: false },
        { name: "Métricas Rápidas", value: "```\n" +
          "Vitórias    : " + (j.vitorias || 0) + "\n" +
          "Derrotas    : " + (j.derrotas || 0) + "\n" +
          "Consecutivo : " + (j.consecutivo || 0) + "\n" +
          "```", inline: false },
      );
    return interaction.editReply({ embeds: [embed] });
  },
};
