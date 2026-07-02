const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require("discord.js");
const { economia } = require("../../DataBaseJson");
const Discord = require("discord.js");

module.exports = {
  name: "recarregarsaldo",
  description: "Use para recarregar saldos",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: 'usuario',
      description: 'Qual usuario irá receber saldo?',
      type: Discord.ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'valor',
      description: 'Qual a quantidade de diamantes?',
      type: Discord.ApplicationCommandOptionType.Number,
      required: true
    }
  ],


  run: async (client, interaction, message) => {


    const user = interaction.options.getUser('usuario')

    const qtd = interaction.options.getNumber('valor')


    const gg = economia.get(user.id)

    if (gg == null) {
      economia.set(user.id, Number(qtd))
    } else {
      economia.set(user.id, Number(gg) + Number(qtd))
    }

    interaction.reply({ ephemeral: true, content: `✅ | Foi setado a quantidade de \`R$ ${Number(qtd).toFixed(2)}\` diamantes ao usuário ${user}` })
    console.log(`✅ | Foi setado a quantidade de \`R$ ${Number(qtd).toFixed(2)}\` diamantes ao usuário ${user}`)
  }
}
