const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { tables, getConfig, updateConfig } = require("../../database/db");
const { sucesso, erro, info, base, COR } = require("../../utils/embeds");
const { isAdmin } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fila")
    .setDescription("Gerenciar filas de partidas")
    .addSubcommand(s => s.setName("criar")
      .setDescription("Criar nova fila")
      .addStringOption(o => o.setName("nome").setDescription("Nome da fila").setRequired(true))
      .addChannelOption(o => o.setName("canal").setDescription("Canal onde os tópicos serão criados").setRequired(true))
      .addStringOption(o => o.setName("jogo").setDescription("Jogo da fila").setRequired(false))
      .addStringOption(o => o.setName("modo").setDescription("Modo de jogo").setAutocomplete(true).setRequired(false))
      .addStringOption(o => o.setName("tipo").setDescription("Tipo de fila").setRequired(false).addChoices(
        { name: "Normal", value: "normal" },
        { name: "Contra Streamer", value: "contra" },
        { name: "Influencer", value: "influencer" }
      ))
      .addNumberOption(o => o.setName("valor_min").setDescription("Aposta mínima").setRequired(false))
      .addNumberOption(o => o.setName("valor_max").setDescription("Aposta máxima").setRequired(false)))
    .addSubcommand(s => s.setName("listar").setDescription("Listar todas as filas"))
    .addSubcommand(s => s.setName("editar")
      .setDescription("Editar uma fila")
      .addIntegerOption(o => o.setName("id").setDescription("ID da fila").setRequired(true))
      .addStringOption(o => o.setName("nome").setDescription("Novo nome").setRequired(false))
      .addStringOption(o => o.setName("jogo").setDescription("Novo jogo").setRequired(false))
      .addStringOption(o => o.setName("modo").setDescription("Novo modo").setRequired(false))
      .addBooleanOption(o => o.setName("ativo").setDescription("Ativar/desativar").setRequired(false)))
    .addSubcommand(s => s.setName("deletar")
      .setDescription("Deletar uma fila")
      .addIntegerOption(o => o.setName("id").setDescription("ID da fila").setRequired(true)))
    .addSubcommand(s => s.setName("padrao")
      .setDescription("Definir fila padrão")
      .addIntegerOption(o => o.setName("id").setDescription("ID da fila").setRequired(true))),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const modos = tables.modos_partida.all();
    const choices = modos.map(m => ({ name: m.nome, value: m.nome }));
    const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));
    await interaction.respond(filtered.slice(0, 25));
  },

  async execute(interaction) {
    const flags = MessageFlags.Ephemeral;
    await interaction.deferReply({ flags });
    const { guild, member } = interaction;
    const sub = interaction.options.getSubcommand();

    if (sub !== "listar" && !isAdmin(member, guild.id, ownerID)) {
      return interaction.editReply({ embeds: [erro("Acesso Negado", "Acesso Negado")] });
    }

    if (sub === "criar") {
      const nome     = interaction.options.getString("nome");
      const canal    = interaction.options.getChannel("canal");
      const jogo     = interaction.options.getString("jogo")     || "Free Fire";
      const modo     = interaction.options.getString("modo")     || "Ranked";
      const tipo     = interaction.options.getString("tipo")     || "normal";
      const valMin   = interaction.options.getNumber("valor_min") ?? 0;
      const valMax   = interaction.options.getNumber("valor_max") ?? 9999;

      const ins = tables.filas.insert({
        guild_id: guild.id,
        nome: nome,
        jogo: jogo,
        modo: modo,
        tipo: tipo,
        canal_id: canal.id,
        valor_minimo: valMin,
        valor_maximo: valMax,
        ativo: 1,
        criado_em: new Date().toISOString()
      });

      const embed = sucesso("Fila de Partida Criada", "A nova fila de operação foi registrada com sucesso.")
        .addFields(
          { name: "Identificação", value: "```\nID #" + ins.id + ": " + nome + "\n```", inline: false },
          { name: "Configuração Jogo", value: "```\n" + jogo + ": " + modo + "\n```", inline: true },
          { name: "Valores (R$)", value: "```\nMín: " + valMin.toFixed(2) + " | Máx: " + valMax.toFixed(2) + "\n```", inline: true }
        );

      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === "listar") {
      const filas = tables.filas.filter(f => f.guild_id === guild.id);
      filas.sort((a, b) => a.id - b.id);
      if (!filas.length) return interaction.editReply({ embeds: [info("Sem Dados", "Não há filas registradas no momento. Recomendado: /fila criar.")], flags });
      const linhas = filas.map(f => "`" + f.id.toString().padStart(2, "0") + ".` **" + f.nome + "** (" + f.jogo + " / " + f.modo + ") | " + (f.ativo ? "Ativa" : "Desativada"));
      return interaction.editReply({ embeds: [base(COR.info).setTitle("Filas Operacionais do Servidor").setDescription(linhas.join("\n"))] });
    }

    if (sub === "editar") {
      const id     = interaction.options.getInteger("id");
      const nome   = interaction.options.getString("nome");
      const jogo   = interaction.options.getString("jogo");
      const modo   = interaction.options.getString("modo");
      const ativo  = interaction.options.getBoolean("ativo");
      const updates = {};
      if (nome  !== null) updates.nome  = nome;
      if (jogo  !== null) updates.jogo  = jogo;
      if (modo  !== null) updates.modo  = modo;
      if (ativo !== null) updates.ativo = ativo ? 1 : 0;
      
      if (!Object.keys(updates).length) return interaction.editReply({ embeds: [erro("Erro nas Modificações", "Nenhum campo foi informado para atualização.")] });
      
      const found = tables.filas.find(f => f.id === id && f.guild_id === guild.id);
      if (!found) return interaction.editReply({ embeds: [erro("Fila não Localizada", "A fila #" + id + " não consta no registro ativo.")] });
      
      tables.filas.update(f => f.id === id && f.guild_id === guild.id, updates);
      return interaction.editReply({ embeds: [sucesso("Modificação Concluída", "As alterações na fila #" + id + " foram aplicadas ao banco de dados.")] });
    }

    if (sub === "deletar") {
      const id = interaction.options.getInteger("id");
      tables.filas.update(f => f.id === id && f.guild_id === guild.id, { ativo: 0 });
      return interaction.editReply({ embeds: [sucesso("Fila Desativada", "A fila #" + id + " foi devidamente removida da operação.")] });
    }

    if (sub === "padrao") {
      const id = interaction.options.getInteger("id");
      const fila = tables.filas.find(f => f.id === id && f.guild_id === guild.id);
      if (!fila) return interaction.editReply({ embeds: [erro("Fila não Localizada", "A fila #" + id + " não consta no registro ativo.")] });
      updateConfig(guild.id, { fila_padrao: id });
      return interaction.editReply({ embeds: [sucesso("Configuração de Padrão", "A fila **" + fila.nome + "** foi definida como padrão para novas partidas.")] });
    }
  },
};
