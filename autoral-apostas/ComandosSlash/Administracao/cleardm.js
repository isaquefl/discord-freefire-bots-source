const Discord = require("discord.js");
const { MessageEmbed, PermissionFlagsBits, MessageActionRow, MessageCollector, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');


module.exports = {
  name: "cleardm",
  description: "[🛠| Utilidades] Limpe todas as mensagens do bot na sua DM!",
  type: Discord.ApplicationCommandType.ChatInput,


  run: async (client, interaction, message) => {
    const dm = await interaction.member.createDM();
    const deleteMessages = await dm.messages.fetch({ limit: 100 });
    let deletedCount = 0;
    await interaction.reply({ephemeral: true, content: `✅ | Irei apagar todas as mensagens da nossa conversa privada!` });

    deleteMessages.forEach(async (msg) => {
      if (msg.author.bot) {
        await msg.delete();
        deletedCount++;
        await interaction.editReply({ephemeral: true, content: `✅ | Total de mensagens apagadas: ${deletedCount}` });
      }
    });
  }
}
