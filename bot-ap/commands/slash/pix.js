const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { tables, getConfig, getJogador } = require("../../database/db");
const { sucesso, erro } = require("../../utils/embeds");
const { isMediador }    = require("../../utils/permissions");
const { ownerID }       = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pix")
    .setDescription("Cadastrar ou atualizar sua chave pix")
    .addStringOption(o => o.setName("chave").setDescription("Sua chave pix").setRequired(true)),

  async execute(interaction) {
    const flags = MessageFlags.Ephemeral;
    await interaction.deferReply({ flags });
    const { guild, user, member } = interaction;
    const chave = interaction.options.getString("chave").trim();
    const cfg   = getConfig(guild.id);

    getJogador(user.id);
    tables.jogadores.update(j => j.discord_id === user.id, { pix: chave });

    if (isMediador(member, guild.id, ownerID)) {
      if (!cfg.permitir_pix_med) {
        return interaction.editReply({ embeds: [erro("Acesso Restrito", "O cadastro de Pix individual para mediadores está desativado no servidor.")] });
      }
      
      const medData = tables.mediadores.find(m => m.discord_id === user.id && m.guild_id === guild.id);
      tables.mediadores.upsert(m => m.discord_id === user.id && m.guild_id === guild.id, {
        discord_id: user.id,
        guild_id: guild.id,
        pix: chave,
        ativo: medData ? medData.ativo : 1
      });
    }

    return interaction.editReply({ embeds: [sucesso("Pix Registrado", "Sua chave Pix foi devidamente atualizada no sistema:").setDescription("```\n" + chave + "\n```")] });
  },
};
