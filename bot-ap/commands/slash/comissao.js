const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { tables } = require("../../database/db");
const { base, erro, COR } = require("../../utils/embeds");
const { isAdmin } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("comissao")
    .setDescription("Ver comissões de mediação")
    .addUserOption(o => o.setName("mediador").setDescription("Mediador (admin apenas)").setRequired(false)),

  async execute(interaction) {
    const flags = MessageFlags.Ephemeral;
    await interaction.deferReply({ flags });
    const { guild, user, member } = interaction;
    const alvo = interaction.options.getUser("mediador");

    if (alvo && alvo.id !== user.id && !isAdmin(member, guild.id, ownerID)) {
      return interaction.editReply({ embeds: [erro("ACESSO NEGADO", "APENAS ADMINISTRADORES PODEM VISUALIZAR COMISSÕES DE TERCEIROS.")] });
    }

    const targetId = alvo ? alvo.id : user.id;
    const m = guild.members.cache.get(targetId);

    const med = tables.mediadores.find(m => m.discord_id === targetId && m.guild_id === guild.id);
    if (!med) return interaction.editReply({ embeds: [erro("Dados Insuficientes", "Este usuário não possui registros de comissão no sistema.")] });

    const ultimas = tables.partidas.filter(p => p.guild_id === guild.id && p.mediador_id === targetId && p.status === "finalizada");
    ultimas.sort((a, b) => new Date(b.finalizado_em) - new Date(a.finalizado_em));
    const recent = ultimas.slice(0, 5);

    const embed = base(COR.info)
      .setAuthor({ name: "Detalhamento de Comissões: " + (m?.displayName || targetId), iconURL: m?.displayAvatarURL({ dynamic: true }) || undefined })
      .addFields(
        { name: "Partidas Mediadas", value: "```\n" + (med.partidas_mediadas || 0) + "\n```", inline: true },
        { name: "Comissão Total",    value: "```\nR$ " + Number(med.comissao_total || 0).toFixed(2) + "\n```", inline: true },
        { name: "Identificador Pix",  value: "```\n" + (med.pix || "Não cadastrado") + "\n```", inline: false },
      );

    if (recent.length) {
      embed.addFields({
        name: "Histórico Recente",
        value: recent.map(p => "`#" + p.id + "` R$ " + Number(p.valor_aposta).toFixed(2) + " | Vencedor: <@" + (p.vencedor_id||"N/A") + ">").join("\n"),
      });
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
