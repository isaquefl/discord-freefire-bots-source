const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { economia } = require("../../DataBaseJson");
const Discord = require("discord.js");

module.exports = {
  name: "saldo",
  description: "Use para recarregar saldos",
  type: ApplicationCommandType.ChatInput,



  run: async (client, interaction, message) => {

    const gg = economia.get(interaction.user.id)

    let valor

    if (gg == null) {
      valor = 0
    } else {
      valor = gg
    }


    interaction.reply({ ephemeral: true, content: `✅ | seu saldo atual e de:  \`R$ ${Number(valor).toFixed(2)}\`` })

  }
}
