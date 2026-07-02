const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { tables, getConfig, getPartidaNoThread, logPartida } = require("../../database/db");
const { erro, info } = require("../../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bo")
    .setDescription("Abrir Análise de B.O. (Screenshot) na Partida Atual")
    .addAttachmentOption(o => o.setName("screenshot").setDescription("Screenshot para Análise").setRequired(true))
    .addStringOption(o => o.setName("motivo").setDescription("Motivo da Análise").setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();
    const { guild, user, channel } = interaction;

    const partida = getPartidaNoThread(channel.id);
    if (!partida) {
      return interaction.editReply({ embeds: [erro("Acesso Negado", "Nenhuma partida ativa encontrada neste canal ou tópico de discussão.")] });
    }

    if (!partida.bo_permitido) {
      return interaction.editReply({ embeds: [erro("Acesso Negado", "O protocolo de análise de capturas está desabilitado para esta partida.")] });
    }

    const img    = interaction.options.getAttachment("screenshot");
    const motivo = interaction.options.getString("motivo") || "Sem motivo especificado";

    const ins = tables.bo_analises.insert({
      guild_id: guild.id,
      partida_id: partida.id,
      requerente: user.id,
      imagem_url: img.url,
      motivo: motivo,
      status: "pendente",
      criado_em: new Date().toISOString()
    });

    logPartida(guild.id, partida.id, "bo", user.id, "B.O. aberto. Motivo: " + motivo);

    const cfg = getConfig(guild.id);

    const boEmbed = info("Análise de Conflito: Partida #" + partida.id, 
      "### Informações do Requerente\n" +
      "**Requerente:** <@" + user.id + ">\n" +
      "**Motivo:** " + motivo + "\n\n" +
      "```\n" +
      "ID Análise : #" + ins.id + "\n" +
      "Status     : Pendente\n" +
      "```").setImage(img.url);

    if (cfg.canal_bo) {
      const boCh = guild.channels.cache.get(cfg.canal_bo);
      if (boCh) {
        const botoes = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("bo_aprovar_" + ins.id).setLabel("APROVAR").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("bo_rejeitar_" + ins.id).setLabel("REJEITAR").setStyle(ButtonStyle.Danger),
        );
        const mention = cfg.cargo_analista ? "<@&" + cfg.cargo_analista + "> " : "";
        await boCh.send({ content: mention + "Nova análise solicitada na partida #" + partida.id + ":", embeds: [boEmbed], components: [botoes] });
      }
    }

    return interaction.editReply({ embeds: [boEmbed] });
  },
};
