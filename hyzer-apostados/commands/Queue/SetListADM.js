const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { admin, perm } = require("../../database/index.js")
const { fila } = require("../../database/index.js")

module.exports = {
    name: "fila-admin",
    description: "[🔍 / Owner] Setagem da fila de administradores!",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "[🛜] Qual será o canal ?",
            type: ApplicationCommandOptionType.Channel
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
        
        const channel = interaction.options.getChannel("canal") || interaction.channel;
        let msg = "";
        const all = await admin.all();
        all.map((rs, index) => {
            msg += ` **\`${index + 1}°\` | <@${rs.ID}> - \`${rs.ID}\`**\n`;
        });

        try {
            const messageData = await fila.get(`MensagensID`);
            const messageDel = messageData?.MensagensIDPanel;
            const messageChannel = interaction.guild.channels.cache.get(messageData?.ChannelIDPanel);
            if (messageDel && messageChannel) {
                const messageDelet = await messageChannel.messages.fetch(messageDel);
                if (messageDelet) {
                    await messageDelet.delete();
                } else {
                    console.error(`❌ | Mensagem do painel admin não encontrada no canal.`);
                }
            } else {
                console.error(`❌ | ID da mensagem de painel admin não encontrado no banco de dados.`);
            }
        } catch (e) {
        }
        await interaction.reply({ content: `**👋 Olá, ${interaction.user}. A mensagem foi enviada com sucesso em**\n*** ${channel.url} | \`\`${channel.id}\`\`**`, ephemeral: true })
        const messsagesetPanelAdmin = await channel.send({
            content: "",
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: 'Entrar em espera...',
                        iconURL: 'https://media.discordapp.net/attachments/1284950746248511548/1284981161663139932/2414-stopwatch.png?ex=66e89b76&is=66e749f6&hm=41348f7746396a2c1ddcf10bf41d219abc37c7f998d47646257339a3d95b8838&=&format=webp&quality=lossless&width=89&height=89',
                    })
                    .setDescription(`> **Orientadores presentes:**\n${msg}`)
                    .setThumbnail(client.user.displayAvatarURL())
                    .setColor('Red')
                    .setTimestamp()
                    .setFooter({
                        text: 'Entre na fila e aguarde ser puxado.',
                        iconURL: client.user.displayAvatarURL(),
                    })
            ],
            
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("entrar_filaAdmin")
                        .setLabel("Entrar em serviço")
                        .setEmoji("<a:sucess:1274922426181877800>")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId("sair_filaAmidn")
                        .setStyle(ButtonStyle.Danger)
                        .setLabel("Sair de serviço")
                        .setEmoji("<a:error:1274922424860676188>")
                )
            ]
        })
        await fila.set(`MensagensID.MensagensIDPanel`, messsagesetPanelAdmin.id)
        await fila.set(`MensagensID.ChannelIDPanel`, interaction.channel.id)
    }
}
