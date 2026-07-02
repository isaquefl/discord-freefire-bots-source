const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { tables, getConfig, updateConfig } = require("../../database/db");
const { sucesso, erro, info } = require("../../utils/embeds");
const { isAdmin } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("streamer")
    .setDescription("Gerenciar painéis de streamers para filas contra viewers (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName("configuracao")
      .setDescription("Configura o modo de painel da streamer")
      .addStringOption(o => o.setName("modo").setDescription("Modo: basico | avancado").addChoices({ name: "Basico", value: "basico" }, { name: "Avancado", value: "avancado" }).setRequired(true)))
    .addSubcommand(s => s.setName("painel")
      .setDescription("Envia o painel exclusive da streamer no canal")
      .addChannelOption(o => o.setName("canal").setDescription("Canal para o painel").setRequired(true))
      .addStringOption(o => o.setName("texto").setDescription("Texto customizado do painel").setRequired(false))),

  async execute(interaction) {
    const { guild, member, options } = interaction;
    const flags = MessageFlags.Ephemeral;
    if (!isAdmin(member, guild.id, ownerID)) return interaction.reply({ embeds: [erro("Acesso Negado", "Acesso Negado")], flags });

    const sub = options.getSubcommand();

    if (sub === "configuracao") {
      const modo = options.getString("modo");
      updateConfig(guild.id, { streamer_modo: modo });
      return interaction.reply({ embeds: [sucesso("Configuração de Streamer", "O modo de operação do painel foi definido para: `" + modo + "`.")], flags });
    }

    if (sub === "painel") {
      const canal = options.getChannel("canal");
      const texto = options.getString("texto") || "Clique no botão abaixo para entrar na fila contra a streamer.";
      const cfg = getConfig(guild.id);

      const embed = info("Painel de Streamer", "### Protocolo de Engajamento\n" + texto)
        .addFields({ name: "Modalidade Ativa", value: "```\n" + (cfg.streamer_modo || "Básico") + "\n```", inline: true });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("streamer_entrar").setLabel("Entrar na Fila").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("streamer_lista").setLabel("Visualizar Fila").setStyle(ButtonStyle.Secondary)
      );

      if (!canal.isTextBased()) return interaction.reply({ embeds: [erro("Canal Inválido", "Por favor, selecione um canal de texto válido.")], flags });

      await canal.send({ embeds: [embed], components: [row] });
      return interaction.reply({ embeds: [sucesso("Operação Concluída", "O painel de streamer foi disparado no canal <#" + canal.id + ">.") ], flags });
    }
  }
};
