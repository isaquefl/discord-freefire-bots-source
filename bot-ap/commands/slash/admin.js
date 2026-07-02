const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { tables, getJogador } = require("../../database/db");
const { sucesso, erro } = require("../../utils/embeds");
const { isAdmin } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Comandos administrativos para gerenciamento de jogadores")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName("addwin")
      .setDescription("Adiciona vitórias a um jogador")
      .addUserOption(o => o.setName("usuario").setDescription("O jogador").setRequired(true))
      .addIntegerOption(o => o.setName("quantidade").setDescription("Quantidade de vitórias").setRequired(true)))
    .addSubcommand(s => s.setName("removewin")
      .setDescription("Remove vitórias de um jogador")
      .addUserOption(o => o.setName("usuario").setDescription("O jogador").setRequired(true))
      .addIntegerOption(o => o.setName("quantidade").setDescription("Quantidade de vitórias").setRequired(true)))
    .addSubcommand(s => s.setName("addcoins")
      .setDescription("Adiciona coins a um jogador")
      .addUserOption(o => o.setName("usuario").setDescription("O jogador").setRequired(true))
      .addIntegerOption(o => o.setName("quantidade").setDescription("Quantidade de coins").setRequired(true)))
    .addSubcommand(s => s.setName("removecoins")
      .setDescription("Remove coins de um jogador")
      .addUserOption(o => o.setName("usuario").setDescription("O jogador").setRequired(true))
      .addIntegerOption(o => o.setName("quantidade").setDescription("Quantidade de coins").setRequired(true)))
    .addSubcommand(s => s.setName("resetar")
      .setDescription("Reseta as estatísticas de um jogador")
      .addUserOption(o => o.setName("usuario").setDescription("O jogador").setRequired(true)))
    .addSubcommand(s => s.setName("vincular")
      .setDescription("Vincula uma conta extra a um mediador")
      .addUserOption(o => o.setName("mediador").setDescription("O mediador").setRequired(true))
      .addUserOption(o => o.setName("extra").setDescription("A conta extra").setRequired(true))),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { guild, member, options } = interaction;
    const sub = options.getSubcommand();

    if (!isAdmin(member, guild.id, ownerID)) {
      return interaction.editReply({ embeds: [erro("Acesso Negado", "Apenas administradores podem utilizar este módulo.")] });
    }

    const alvo = options.getUser("usuario") || options.getUser("mediador");

    if (sub === "addwin") {
      const qtd = options.getInteger("quantidade");
      const j = getJogador(alvo.id);
      tables.jogadores.update(u => u.discord_id === alvo.id, { vitorias: (j.vitorias || 0) + qtd });
      return interaction.editReply({ embeds: [sucesso("Estatistica Atualizada", "Adicionado " + qtd + " vitorias para <@" + alvo.id + ">.")] });
    }

    if (sub === "removewin") {
      const qtd = options.getInteger("quantidade");
      const j = getJogador(alvo.id);
      tables.jogadores.update(u => u.discord_id === alvo.id, { vitorias: Math.max(0, (j.vitorias || 0) - qtd) });
      return interaction.editReply({ embeds: [sucesso("Estatistica Atualizada", "Removido " + qtd + " vitorias de <@" + alvo.id + ">.")] });
    }

    if (sub === "addcoins") {
      const qtd = options.getInteger("quantidade");
      const j = getJogador(alvo.id);
      tables.jogadores.update(u => u.discord_id === alvo.id, { coins: (j.coins || 0) + qtd });
      return interaction.editReply({ embeds: [sucesso("Estatistica Atualizada", "Adicionado " + qtd + " coins para <@" + alvo.id + ">.")] });
    }

    if (sub === "removecoins") {
      const qtd = options.getInteger("quantidade");
      const j = getJogador(alvo.id);
      tables.jogadores.update(u => u.discord_id === alvo.id, { coins: Math.max(0, (j.coins || 0) - qtd) });
      return interaction.editReply({ embeds: [sucesso("Estatistica Atualizada", "Removido " + qtd + " coins de <@" + alvo.id + ">.")] });
    }

    if (sub === "resetar") {
      tables.jogadores.update(u => u.discord_id === alvo.id, { vitorias: 0, derrotas: 0, coins: 0, consecutivo: 0 });
      return interaction.editReply({ embeds: [sucesso("Jogador Resetado", "As estatisticas de <@" + alvo.id + "> foram zeradas.")] });
    }

    if (sub === "vincular") {
      const extra = options.getUser("extra");
      const existing = tables.mediadores_contas.find(c => c.guild_id === guild.id && c.conta_extra === extra.id);
      if (existing) {
        return interaction.editReply({ embeds: [erro("Erro No Vinculo", "Esta conta ja esta vinculada ao mediador.")] });
      }
      tables.mediadores_contas.insert({ guild_id: guild.id, discord_id: alvo.id, conta_extra: extra.id });
      return interaction.editReply({ embeds: [sucesso("Conta Vinculada", "A conta <@" + extra.id + "> foi vinculada ao mediador <@" + alvo.id + ">.")] });
    }
  }
};
