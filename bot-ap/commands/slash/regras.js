const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { base, COR } = require("../../utils/embeds");
const { getConfig } = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("regras")
    .setDescription("Visualiza os termos e regras de apostas"),

  async execute(interaction) {
    const { guild } = interaction;
    const cfg = getConfig(guild.id);
    const flags = MessageFlags.Ephemeral;

    const embed = base(COR.roxo)
      .setTitle("Apostado: Diretrizes e Conduta")
      .setDescription(cfg.regras_texto || "As regras ainda não foram definidas pela administração do servidor.");

    return interaction.reply({ embeds: [embed], flags });
  }
};
