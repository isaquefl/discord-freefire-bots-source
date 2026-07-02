const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    name: "blacklist",
    description: "[👷 / Orientadores] Sistema de BlackList!",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "ato",
            description: "[🔍] Selecione o ato que deseja realizar!",
            choices: [
                {
                    name: "Adicionar", value: "add"
                },
                {
                    name: "Remover", value: "remove"
                },
            ],
            required: true,
            type: ApplicationCommandOptionType.String
        },

    ],
    run: async (client, interaction) => {
        const ownerId = require("../../token.json").owner;

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: `**❌ ・ Você não possui permissão para utilizar este comando.**`,
                ephemeral: true,
            });
        };
        const ato = await interaction.options.getString("ato");

        if (ato === "add") {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Adicionar Usuário à Blacklist')
                        .setColor("Green")
                        .setFooter({ text: `${interaction.guild.name} | BlackList!`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                        .setDescription(`**🎯 | Para adicionar um usuário a blacklist, coloque as seguintes informações no formulário:**\n- **Coloque o Nome da Pessoa;**\n- **Coloque o ID do discord;**\n- **Coloque o ID do jogo;**\n- **Coloque as provas (LINK)**\n> **Após seguir estes passos, envie o formulário e a blacklist já estará dada!** `)
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_DarBlackListButton`)
                            .setLabel("Enviar BlackList")
                            .setStyle(ButtonStyle.Success)
                            .setEmoji("<:pasta:1289595444879425567>")
                    )

                ]
            });

        } else if (ato === "remove") {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Remover Usuário da Blacklist')
                        .setColor("Red")
                        .setTimestamp()
                        .setDescription("**🎯 | Para remover um usuário da blacklist, coloque as seguintes informações no formulário:**\n- **Coloque o ID Em Game;**\n- **Coloque o motivo da Recorrência;**\n- **Coloque as provas (caso tenha).**\n> **Após seguir estes passos, terá a blacklist do jogador removida!**")
                        .setFooter({ text: `${interaction.guild.name} | BlackList!`, iconURL: interaction.user.displayAvatarURL() })
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_RemoverBlackListButton`)
                            .setLabel("Remover BlackList")
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji("<:pasta:1289595444879425567>")
                    )
                ]
            });
        };

    }
};