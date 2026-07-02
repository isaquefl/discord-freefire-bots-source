const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { Perms, General, Emojis } = require("../../Database");

module.exports = {
    name: "permremove",
    description: "⚡️ | Remova a permissão de alguém.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "Selecione o usuário",
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    
    run: async(client, interaction) => {
        if (interaction.user.id != General.get('Creator')) {
            const embed = new EmbedBuilder()
                .setDescription(`${Emojis.get('Errado')} | Você não possui permissão para utilizar esse comando.`)
                .setColor(General.get('Cor').Error || '#F59133');
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const userx = interaction.options.getUser("user");

        if (!Perms.has(userx.id)) {
            const embed = new EmbedBuilder()
                .setDescription(`${Emojis.get('Errado')} | O usuário selecionado não possui permissão.`)
                .setColor(General.get('Cor').Error || '#F59133');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        Perms.delete(userx.id);
        const embed = new EmbedBuilder()
            .setDescription(`${Emojis.get('Certo')} | Permissão removida para o usuário ${userx} com sucesso.`)
            .setColor(General.get('Cor').Sucess || '#33F53D');

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

