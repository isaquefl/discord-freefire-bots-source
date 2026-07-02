const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { Perms, General, Emojis } = require("../../Database");

module.exports = {
    name: "permlist",
    description: "⚡️ | Veja quem tem permissão.",
    type: ApplicationCommandType.ChatInput,
    
    run: async (client, interaction) => {
        if (interaction.user.id != General.get('Creator')) {
            const embed = new EmbedBuilder()
                .setDescription(`${Emojis.get('Errado')} | Você não possui permissão para utilizar esse comando.`)
                .setColor(General.get('Cor').Error || '#F59133');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const permsUsers = Perms.all()
            .map(entry => `<@${entry.ID}> - \`${entry.ID}\``)
            .join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle(`${Emojis.get('User')} - Membros com permissão - ${Perms.all().length}`)
            .setDescription(Perms.all().length === 0 
                ? `${Emojis.get('Errado')} | Nenhum usuário possui permissão.` 
                : permsUsers)
            .setColor(General.get('Cor').Principal || '#010101');

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

