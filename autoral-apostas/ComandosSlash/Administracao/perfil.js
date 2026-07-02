const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require("discord.js");
const { economia } = require("../../DataBaseJson");
const Discord = require("discord.js");
const config = require('../../config.json')

module.exports = {
  name: "anunciarperfil",
  description: "anunciarperfil",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,



  run: async (client, interaction, message) => {


    const embed = new EmbedBuilder()
   //   .setColor(`Green`)
      .setTitle(`⛏️ Perfil ${interaction.guild.name}`)
      .setDescription(`- Clique abaixo para mais informações sobre sua conta na \`${interaction.guild.name}\``)
      .setFooter(
        { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
      )
      .setTimestamp()

      const button3 = new ButtonBuilder()
      .setCustomId(`jogarmines`)
     // .setEmoji(`1106614135652880525`)
      .setStyle(2)
      .setDisabled(false)
      .setLabel('Jogar Mines');

    const button = new ButtonBuilder()
      .setCustomId(`depositarmoney`)
      .setEmoji(`1106613970082742292`)
      .setStyle(3)
      .setDisabled(false)
      .setLabel('Depositar');

    const novoBotao = new ButtonBuilder()
      .setCustomId(`perfil`)
      .setEmoji(`1048640088042655834`)
      .setStyle(2)
      .setDisabled(false)
      .setLabel('Perfil');

      const jogar = new ButtonBuilder()
      .setCustomId(`cronoz`)
      .setEmoji(`<:play:1186657469481631754>`)
      .setStyle(2)
      .setDisabled(false)
      .setLabel('Jogar');

    const button2 = new ButtonBuilder()
      .setCustomId(`sacarmoney`)
      .setEmoji(`1106614135652880525`)
      .setStyle(4)
      .setDisabled(false)
      .setLabel('Sacar');

    const novoBotaoRow = new ActionRowBuilder().addComponents(button, novoBotao, button2);

    interaction.reply({ content: `✅ Mensagem enviada!`, ephemeral: true })
    interaction.channel.send({ /*embeds: [embed],*/ content: `# <:autoral_bomba:1226399971662630923> Aposta Mines | Autoral\n- Clique abaixo para mais informações sobre sua conta na \`${interaction.guild.name}\`\n- Verifique sempre os termos e condições para garantir uma experiência tranquila.\n- Jogar com responsabilidade é fundamental para uma experiência positiva.\n- Faça uma ap0st4 no canal https://discord.com/channels/1220154218741239951/1226396366972915742 utilizando o comando \`/mines (valor)\``, components: [novoBotaoRow] })
    
  }
}
