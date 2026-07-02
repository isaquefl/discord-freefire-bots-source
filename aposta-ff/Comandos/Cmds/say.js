const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { Perms, General, Emojis } = require("../../Database");

module.exports = {
    name: "say",
    description: "⚡️ | Envie uma mensagem.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "texto",
            description: "Digite a mensagem",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "canal",
            description: "Selecione o canal",
            type: ApplicationCommandOptionType.Channel,
            required: false
        }
    ],
    
    run: async(client, interaction) => {
        const texto = interaction.options.getString("texto");
        const canal = interaction.options.getChannel("canal") || interaction.channel;
        
        if (!Perms.has(interaction.user.id)) {
            const embed = new EmbedBuilder()
                .setDescription(`${Emojis.get('Errado')} | Você não possui permissão para utilizar esse comando.`)
                .setColor(General.get('Cor')?.Error || '#F59133'); 
        
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('• Ver Canal')
                    .setStyle(5)
                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${canal.id}`)
            );
        
        try {
            await canal.send(texto);
            const embed = new EmbedBuilder()
                .setDescription(`${Emojis.get('Certo')} | Mensagem enviada com sucesso!`)
                .setColor(General.get('Cor')?.Sucess || '#33F53D');

            interaction.reply({ 
                embeds: [embed],
                components: [button],
                ephemeral: true 
            });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setDescription(`${Emojis.get('Errado')} | Ocorreu um erro ao enviar a mensagem no canal.`)
                .setColor(General.get('Cor')?.Error || '#F59133');

            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};

