module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                return await interaction.reply({
                    content: `❌ | Nenhum comando correspondente a **${interaction.commandName}** foi encontrado.`,
                    ephemeral: true
                });
            }

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error(err);
                return interaction.reply({
                    content: `❌ | Erro ao executar o comando **${interaction.commandName}**:\`\`\`js\n${err.message}\`\`\``,
                    ephemeral: true
                });
            }
        }
    },
};