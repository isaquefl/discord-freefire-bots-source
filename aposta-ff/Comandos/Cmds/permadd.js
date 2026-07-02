const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { Perms, General, Emojis } = require("../../Database");

module.exports = {
    name: "permadd",
    description: "⚡️ | Dê permissão para alguém.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "Selecione o usuário",
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],

    run: async (client, interaction) => {
        if (interaction.user.id != General.get('Creator')) {
            const embed = new EmbedBuilder()
                .setDescription(`${Emojis.get('Errado')} | Você não possui permissão para utilizar esse comando.`)
                .setColor(General.get('Cor')?.Error || '#F53333');
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const userx = interaction.options.getUser("user");

        if (Perms.has(userx.id)) {
            const embed = new EmbedBuilder()
                .setDescription(`${Emojis.get('Errado')} | O usuário selecionado já possui permissão.`)
                .setColor(General.get('Cor')?.Warn || '#F59133');
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        Perms.set(userx.id, userx.id);
        const embed = new EmbedBuilder()
            .setDescription(`${Emojis.get('Certo')} | Permissão concedida para o usuário ${userx} com sucesso.`)
            .setColor(General.get('Cor')?.Sucess || '#33F53D');

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

