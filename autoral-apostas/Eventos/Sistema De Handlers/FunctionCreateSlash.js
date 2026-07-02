const client = require("../../index");
const Discord = require("discord.js")

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {
        if (interaction.isChatInputCommand()) {

            const cmd = client.slashCommands.get(interaction.commandName);

            if (!cmd) return interaction.reply(`Ocorreu algum erro amigo.`);

            interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

            cmd.run(client, interaction)

        }
    }
}