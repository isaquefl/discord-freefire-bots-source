const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { perm } = require("../../database");

module.exports = {
    name: "pix-admins",
    description: "[👷 / Owner] Envie o painel para enviar chave pix!",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Qual será o canal ?",
            type: ApplicationCommandOptionType.Channel,
            required: false
        }
    ],
    run: async (client, interaction) => {
        const ownerId = require("../../token.json").owner;
        const verifyPerm = await perm.get(interaction.user.id);

        if (interaction.user.id !== ownerId && interaction.user.id !== verifyPerm) {
            return interaction.reply({
                content: `**❌ ・ Você não possui permissão para utilizar este comando.**`,
                ephemeral: true,
            });
        }

        const channel = await interaction.options.getString("canal") || interaction.channel;
        await interaction.reply({ content: `**🔔 | Mensagem enviada com sucesso!**`, ephemeral: true })
        await channel.send({
            embeds: [
                new EmbedBuilder()
                .setColor("Red")
                .setTitle("Envie sua chave Pix")
                .setTimestamp()
                .setDescription(`- **Sistema de automatização de pagamentos!**\n - **Como funciona?**\n> O sistema de automatização de pagamentos é essencial para que todos os mediadores garantam a agilidade nas partidas abertas. Após configurar, nunca mais precisará enviar novamente sua chave PIX nas salas criadas. Eu farei todo o trabalho!`)
                .setFooter({ text: `${interaction.guild.name} | Automatização de Pagamentos`})
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId("enviarchaveadmin")
                    .setLabel("Enviar Método PIX")
                    .setEmoji("1254027270323044363")
                    .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                    .setCustomId("verificarchaveadmin")
                    .setLabel("Verificar Status")
                    .setEmoji("1289725244147240991")
                    .setStyle(ButtonStyle.Primary)
                )
            ]

        })
    }
}