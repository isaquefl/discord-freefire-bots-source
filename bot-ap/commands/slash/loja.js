const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { tables, getJogador } = require("../../database/db");
const { sucesso, erro, info, base, COR } = require("../../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loja")
    .setDescription("Sistema de mercado e inventário")
    .addSubcommand(s => s.setName("itens").setDescription("Ver itens disponíveis no mercado"))
    .addSubcommand(s => s.setName("caixas").setDescription("Ver caixas de suprimentos"))
    .addSubcommand(s => s.setName("comprar").setDescription("Comprar um item pelo ID").addIntegerOption(o => o.setName("id").setDescription("ID do item").setRequired(true)))
    .addSubcommand(s => s.setName("inventario").setDescription("Ver seus itens adquiridos")),

  async execute(interaction) {
    const flags = MessageFlags.Ephemeral;
    const { guild, user, options } = interaction;
    const sub = options.getSubcommand();

    if (sub === "itens") {
      const itens = tables.itens_loja.filter(i => i.guild_id === guild.id && i.ativo);
      if (!itens.length) return interaction.reply({ embeds: [info("Loja Vazia", "Não há itens disponíveis no momento.")], flags });
      const embed = base(COR.ouro).setTitle("Mercado de Itens").setDescription(itens.map(i => "**" + i.nome + "** (" + i.preco + " coins) [" + (i.raridade || "Comum") + "]").join("\n"));
      return interaction.reply({ embeds: [embed], flags });
    }

    if (sub === "comprar") {
      const id = options.getInteger("id");
      const item = tables.itens_loja.find(i => i.id === id && i.guild_id === guild.id && i.ativo);
      if (!item) return interaction.reply({ embeds: [erro("Item não Localizado", "O item #" + id + " não está disponível.")], flags });

      const jogador = getJogador(user.id);
      if (jogador.coins < item.preco) return interaction.reply({ embeds: [erro("Saldo Insuficiente", "Você precisa de " + item.preco + " coins para este item.")], flags });

      tables.jogadores.update(j => j.discord_id === user.id, { coins: jogador.coins - item.preco });
      tables.inventario.insert({ discord_id: user.id, guild_id: guild.id, item_id: id, obtido_em: new Date().toISOString() });

      return interaction.reply({ embeds: [sucesso("Compra Realizada", "Você adquiriu `" + item.nome + "` por " + item.preco + " coins.")], flags });
    }

    if (sub === "caixas") {
      const caixas = tables.caixas.filter(c => c.guild_id === guild.id && c.ativo);
      if (!caixas.length) return interaction.reply({ embeds: [info("Caixas Indisponíveis", "Não há caixas cadastradas no momento.")], flags });

      const embed = base(COR.ouro)
        .setTitle("Loja: Caixas e Suprimentos")
        .setDescription("```\n" + caixas.map(c => "ID #" + c.id + " " + c.nome + " : R$ " + c.preco.toLocaleString("pt-BR") + "\n" + (c.descricao || "")).join("\n\n") + "\n```");
      
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("loja_abrir_caixa").setLabel("Abrir Caixa").setStyle(ButtonStyle.Success)
      );

      return interaction.reply({ embeds: [embed], components: [row], flags });
    }

    if (sub === "inventario") {
      const inv = tables.inventario.filter(i => i.discord_id === user.id);
      if (!inv.length) return interaction.reply({ embeds: [info("Mochila Vazia", "Você não possui itens em seu inventário.")], flags });
      const itens = inv.map(v => {
        const i = tables.itens_loja.find(x => x.id === v.item_id);
        return "• **" + (i?.nome || "Item Desconhecido") + "**";
      });
      const embed = base(COR.roxo).setTitle("Seu Inventário").setDescription(itens.join("\n"));
      return interaction.reply({ embeds: [embed], flags });
    }
  }
};
