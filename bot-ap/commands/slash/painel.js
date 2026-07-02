const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { updateConfig, getConfig, tables } = require("../../database/db");
const { sucesso, erro, info, base, COR } = require("../../utils/embeds");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("painel")
    .setDescription("Central Administrativa: Painel de Gestão VIP")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const { user } = interaction;
    const flags = MessageFlags.Ephemeral;

    if (user.id !== ownerID) {
      return interaction.reply({ embeds: [erro("Acesso Negado", "Este painel é restrito ao proprietário do bot.")], flags });
    }

    const embed = base(COR.ouro)
      .setTitle("Painel Administrativo: Apostado VIP")
      .setDescription(
        "Bem-vindo ao centro de controle. Utilize os botões abaixo para configurar os parâmetros operacionais do seu sistema de forma rápida e segura.\n\n" +
        "**Canais**\nLogs, B.O. e Rankings.\n\n" +
        "**Cargos**\nMediadores e Administradores.\n\n" +
        "**Economia**\nRecompensas e Taxas.\n\n" +
        "**Modos**\nGerenciar categorias de X1.\n\n" +
        "**Regras**\nDefinir termos de uso.\n\n" +
        "**Setup**\nEnviar menu de interação."
      );

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("admin_btn_canais").setLabel("Canais").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("admin_btn_cargos").setLabel("Cargos").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("admin_btn_economia").setLabel("Economia").setStyle(ButtonStyle.Success)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("admin_btn_modos").setLabel("Modos").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("admin_btn_regras").setLabel("Regras").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("admin_btn_setup").setLabel("Setup").setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({ embeds: [embed], components: [row1, row2], flags });
  }
};
