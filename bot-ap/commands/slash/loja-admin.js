const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { tables } = require("../../database/db");
const { sucesso, erro } = require("../../utils/embeds");
const { isAdmin } = require("../../utils/permissions");
const { ownerID } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loja-admin")
    .setDescription("Gerenciamento administrativo da loja e caixas")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName("criar")
      .setDescription("Criar item na loja")
      .addStringOption(o => o.setName("nome").setDescription("Nome do item").setRequired(true))
      .addIntegerOption(o => o.setName("preco").setDescription("Preço em coins").setRequired(true))
      .addStringOption(o => o.setName("raridade").setDescription("Raridade do item").setRequired(true))
      .addStringOption(o => o.setName("descricao").setDescription("Descrição").setRequired(false)))
    .addSubcommand(s => s.setName("caixa_criar")
      .setDescription("Criar uma nova caixa")
      .addStringOption(o => o.setName("nome").setDescription("Nome da caixa").setRequired(true))
      .addIntegerOption(o => o.setName("preco").setDescription("Preço para abrir").setRequired(true))
      .addStringOption(o => o.setName("gif_url").setDescription("Link do GIF de abertura").setRequired(false))
      .addStringOption(o => o.setName("cor").setDescription("Cor hex (ex: #D4AF37)").setRequired(false)))
    .addSubcommand(s => s.setName("caixa_add_item")
      .setDescription("Adicionar item a uma caixa")
      .addIntegerOption(o => o.setName("caixa_id").setDescription("ID da caixa").setRequired(true))
      .addIntegerOption(o => o.setName("item_id").setDescription("ID do item").setRequired(true))
      .addIntegerOption(o => o.setName("peso").setDescription("Peso/Chance do item").setRequired(false))),

  async execute(interaction) {
    const { guild, member, options } = interaction;
    const flags = MessageFlags.Ephemeral;
    if (!isAdmin(member, guild.id, ownerID)) return interaction.reply({ embeds: [erro("Acesso Negado", "Acesso Negado")], flags });

    const sub = options.getSubcommand();

    if (sub === "criar") {
      const nome     = options.getString("nome");
      const preco    = options.getInteger("preco");
      const raridade = options.getString("raridade");
      const desc     = options.getString("descricao") || "Sem descrição disponível.";

      const ins = tables.itens_loja.insert({
        guild_id: guild.id,
        nome: nome,
        preco: preco,
        raridade: raridade,
        descricao: desc,
        ativo: 1
      });

      return interaction.reply({ embeds: [sucesso("Item de Loja Criado", "O item `" + nome + "` foi indexado ao mercado local.")
        .addFields(
          { name: "Identificador", value: "```\n#" + ins.id + "\n```", inline: true },
          { name: "Preço", value: "```\n" + preco + " coins\n```", inline: true },
          { name: "Raridade", value: "```\n" + raridade.toUpperCase() + "\n```", inline: true }
        )], flags });
    }

    if (sub === "caixa_criar") {
      const nome   = options.getString("nome");
      const preco  = options.getInteger("preco");
      const cor    = options.getString("cor") || "#D4AF37";
      const gif    = options.getString("gif_url");

      const ins = tables.caixas.insert({
        guild_id: guild.id,
        nome: nome,
        preco: preco,
        cor: cor,
        gif_url: gif,
        ativo: 1
      });

      return interaction.reply({ embeds: [sucesso("Caixa de Sorteio Criada", "A caixa `" + nome + "` foi adicionada ao catálogo.")
        .addFields(
          { name: "Identificador", value: "```\n#" + ins.id + "\n```", inline: true },
          { name: "Preço", value: "```\n" + preco + " coins\n```", inline: true }
        )], flags });
    }

    if (sub === "caixa_add_item") {
      const caixaId = options.getInteger("caixa_id");
      const itemId  = options.getInteger("item_id");
      const peso    = options.getInteger("peso") || 10;

      const c = tables.caixas.find(x => x.id === caixaId && x.guild_id === guild.id);
      const i = tables.itens_loja.find(x => x.id === itemId && x.guild_id === guild.id);

      if (!c || !i) return interaction.reply({ embeds: [erro("Entidade não Localizada", "Verifique se o ID da caixa e do item estão corretos.")], flags });

      tables.caixas_itens.insert({ caixa_id: caixaId, item_id: itemId, peso: peso });
      return interaction.reply({ embeds: [sucesso("Item Vinculado", "O item `" + i.nome + "` agora faz parte das recompensas da caixa `" + c.nome + "`.")], flags });
    }
  }
};
