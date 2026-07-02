const { ApplicationCommandType, ApplicationCommandOptionType, ModalBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { perm } = require("../../database/index")
module.exports = {
    name: "perms",
    description: "[👷 / Owner] Gerencie as permissões do bot!",
    type: ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const ownerId = require("../../token.json").owner;

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: `**❌ ・ Você não possui permissão para utilizar este comando.**`,
                ephemeral: true,
            });
        };
        let msg = "";

        const all = perm.all()
        all.map((rs, index) => {
        msg += `\`\`${index + 1}\`\` <@${rs.ID}> - \`\`${rs.ID}\`\`\n`
        })

        const embed = new EmbedBuilder()
        .setTimestamp()
        .setDescription(`- **🎯 | Abaixo, estas visualizando todos os membros presentes em minhas permissões**.\n\n${msg}\n\n> **Para adicionar ou remover algum membro a lista, utilize os botões abaixo!**\n> **Lembre-se, adicione somente pessoas de confiança pois elas podem destruir seu servidor sobre minha posse.**`)
        await interaction.reply({
            embeds: [
                embed
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_AddPerm`)
                        .setLabel("Adicionar")
                        .setEmoji("1277069263160606782")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_RemovePerm`)
                        .setLabel("Remover")
                        .setEmoji("1277069236774240276")
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        })


    }
}