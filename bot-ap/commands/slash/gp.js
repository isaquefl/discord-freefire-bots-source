const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { tables, getConfig, getJogador, getPartidaAtiva, logPartida } = require("../../database/db");
const { sucesso, erro, info, base, COR, partidaEmbed } = require("../../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gp")
    .setDescription("Gerar partida de apostado")
    .addNumberOption(o => o.setName("valor").setDescription("Valor da aposta em R$").setRequired(true))
    .addStringOption(o => o.setName("modo").setDescription("Modo (ex: UMP, Desert)").setRequired(false).setAutocomplete(true))
    .addIntegerOption(o => o.setName("fila").setDescription("Escolher uma fila específica").setRequired(false)),

  async execute(interaction) {
    const flags = MessageFlags.Ephemeral;
    await interaction.deferReply({ flags });
    const { guild, user, channel } = interaction;

    if (getPartidaAtiva(user.id, guild.id)) {
      return interaction.editReply({ embeds: [erro("Ação Bloqueada", "Você já possui uma partida ativa no sistema.")] });
    }

    const valor = interaction.options.getNumber("valor");
    const m = interaction.options.getString("modo");
    const fId = interaction.options.getInteger("fila");
    
    const cfg = getConfig(guild.id);
    const filaId = fId || cfg.fila_padrao;
    const fila = tables.filas.find(f => f.id === filaId && f.guild_id === guild.id);

    if (fila) {
      if (valor < (fila.valor_minimo || 0) || valor > (fila.valor_maximo || 9999)) {
        return interaction.editReply({ embeds: [erro("Limites de Aposta", "O valor R$ " + valor.toFixed(2) + " está fora dos limites desta fila (Mín: R$ " + (fila.valor_minimo || 0).toFixed(2) + " | Máx: R$ " + (fila.valor_maximo || 9999).toFixed(2) + ").")] });
      }
    }

    const modoFinal = (m || fila?.modo || "Ranked");

    const ins = tables.partidas.insert({
      guild_id: guild.id,
      fila_id: filaId,
      criador_id: user.id,
      valor_aposta: valor,
      modo: modoFinal,
      canal_id: channel.id,
      status: "aguardando",
      criado_em: new Date().toISOString(),
      bo_permitido: 1
    });

    logPartida(guild.id, ins.id, "criacao", user.id, "Solicitação de partida criada pelo usuário.");

    const embed = info("Solicitação de Partida", 
      "### Protocolo de Desafio\n" +
      "<@" + user.id + "> está em busca de um oponente para uma partida casada.\n\n" +
      "```\n" +
      "Valor Aposta : R$ " + valor.toFixed(2) + "\n" +
      "Modos de Jogo: " + modoFinal + "\n" +
      "```");

    const botoes = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("gp_aceitar_" + ins.id).setLabel("Aceitar Desafio").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("partida_cancelar_" + ins.id).setLabel("Cancelar").setStyle(ButtonStyle.Danger)
    );

    const msg = await channel.send({ embeds: [embed], components: [botoes] });
    tables.partidas.update(p => p.id === ins.id, { mensagem_id: msg.id });

    return interaction.editReply({ embeds: [sucesso("Ordem de Partida", "Sua ordem de partida `#" + ins.id + "` foi publicada em <#" + channel.id + ">")] });
  },
};
