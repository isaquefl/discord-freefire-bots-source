const { 
    ApplicationCommandType, 
    ApplicationCommandOptionType, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require("discord.js");
const { perm } = require("../../database");

module.exports = {
    name: "set-consultas",
    description: "Configura o painel de consultas de trapaceiros.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Selecione o canal onde o painel será enviado.",
            type: ApplicationCommandOptionType.Channel,
            required: false
        }
    ],
    run: async (client, interaction) => {
        const ownerId = require("../../token.json").owner;
        const verifyPerm = await perm.get(interaction.user.id);

        if (interaction.user.id !== ownerId && interaction.user.id !== verifyPerm) {
            return interaction.reply({
                content: "❌ Você não tem permissão para usar este comando.",
                ephemeral: true,
            });
        }

        const channel = interaction.options.getChannel("canal") || interaction.channel;

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🔍 Painel de Consultas")
                    .setDescription(
                        `Olá! Utilize este painel para realizar consultas de usuários.\n\n` +
                        `> **Como funciona?**\n` +
                        `Clique no botão abaixo e insira o ID do usuário que deseja pesquisar.`
                    )
                    .setColor(0x5865F2) // Azul padrão do Discord
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setFooter({
                        text: `${interaction.guild.name} • Painel de Consultas`,
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    })
                    .setTimestamp()
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("pesquisarusuário")
                        .setLabel("Pesquisar")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("🔍") // Emojis padrão do Discord
                )
            ]
        });

        await interaction.reply({ 
            content: `✅ O painel de consultas foi enviado com sucesso no canal ${channel}.`,
            ephemeral: true 
        });
    }
};