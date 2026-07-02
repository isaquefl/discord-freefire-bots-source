const Discord = require("discord.js");
const { MessageEmbed, PermissionFlagsBits, MessageActionRow, ButtonBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: "botconfig",
    description: "[🛠| Utilidades] Use para configurar o seu bot",
    type: Discord.ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,

    run: async (client, interaction, message) => {



        const embed = new EmbedBuilder()
            
            .setAuthor({ name: `Configuração - ${client.user.username}`, iconUrl: interaction.guild.iconURL({ dynamic: true }) })


        const button = new ButtonBuilder()
            .setCustomId(`logssaques`)
            .setStyle(2)
            .setLabel('Logs Saques');

            const button2 = new ButtonBuilder()
            .setCustomId(`logsresgatados`)
            .setStyle(2)
            .setLabel('Logs Resgatados');


            const button6 = new Discord.ButtonBuilder()
            .setCustomId(`tokenmp`)
            .setStyle(2)
            .setLabel('Token Mercado pago');


        const novoBotaoRow = new ActionRowBuilder().addComponents(button6, button, button2)

        const button3 = new ButtonBuilder()
        .setCustomId(`logsperdidos`)
        .setStyle(2)
        .setLabel('Logs Perdidos');

        const button4 = new ButtonBuilder()
        .setCustomId(`logdeposito`)
        .setStyle(2)
        .setLabel('Logs Depositados');

        const button5 = new ButtonBuilder()
        .setCustomId(`logsiniciougame`)
        .setStyle(2)
        .setLabel('Logs Iniciou Game');


        const novoBotaoRow2 = new ActionRowBuilder().addComponents( button3, button4, button5)

        interaction.reply({ ephemeral: true, content:`${interaction.user}`, embeds: [embed], components: [novoBotaoRow,novoBotaoRow2]})
    }
}

