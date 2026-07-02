const { ApplicationCommandType } = require("discord.js")
const { ranking } = require("../../database")
const owner = require("../../token.json")

module.exports = {
    name: "del-ranking",
    description: "[🎯 / Owner] Delete o ranking de filas!",
    type: ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {


        const ownerId = require("../../token.json").owner;

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: `**❌ ・ Você não possui permissão para utilizar este comando.**`,
                ephemeral: true,
            });
        }

        await ranking.deleteAll()
        await interaction.reply({ content: `**🎯 | Ranking deletado com sucesso!**` })
    }
}