const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { fila } = require("../../database/index")

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;

        if (!customId) return;

        if (
            (interaction.isStringSelectMenu() && customId === "optionsFilasConfig") ||
            (interaction.isButton() && await fila.get(`Filas`))
        ) {
            if (interaction.isStringSelectMenu()) {
                const category = await fila.get(`Channels.categoryAbertura`)
                await interaction.reply({ content: `**🔄 | Carregando informações...**`, ephemeral: true })
                if (!category) {
                    return interaction.editReply({ content: `**❌ | Categoria de filas não foi definida!**` })
                }

                const selectedValues = interaction.values[0];
                const filaInfo = await fila.get(`Filas.${selectedValues}`);

                try {
                    const messageData = await fila.get(`Filas.${selectedValues}.InfosMensagem`);
                    const messageDel = messageData?.Mensagem;
                    const messageChannel = interaction.guild.channels.cache.get(messageData?.Channel);
                    if (messageDel && messageChannel) {
                        const messageDelet = await messageChannel.messages.fetch(messageDel);
                        if (messageDelet) {
                            await messageDelet.delete();
                        } else {
                            console.error(`❌ | Mensagem de ${filaInfo.Nome} admin não encontrada no canal.`);
                        }
                    } else {
                        console.error(`❌ | ID da mensagem de painel ${filaInfo.Nome} não encontrado no banco de dados.`);
                    }
                } catch (e) {
                }
                await interaction.editReply({ content: `**🔍 | Informações encontradas, painel setado.**`, ephemeral: true })

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Hyzer Apostados 0% DE TAXA" })
                    .setDescription(`\n<:jogar:1329271365672505384> | **Modo: \`${filaInfo.Modo} x ${filaInfo.Modo} ${filaInfo.Nome}\`**\n**<:dinheiro:1329271641586405518> | Valor: \`\`R$${filaInfo.Valor}\`\`**\n<:user:1329271763447709768> | **Jogadores:** \`Sem jogadores.\``)
                    .setColor("#FF0000")
                    .setTimestamp()
                    .setThumbnail(`${client.user.displayAvatarURL()}`)
                    .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });

                const msgInicial = await interaction.channel.send({
                    content: "", embeds: [embed],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId("entrar_fila")
                                    .setLabel("Entrar na fila")
                                    .setEmoji("✅")
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId("sair_fila")
                                    .setLabel("Sair da Fila")
                                    .setStyle(ButtonStyle.Danger)
                                    .setEmoji("❌")

                            )
                    ]
                })

                await fila.set(`Filas.${selectedValues}`, {
                    Nome: filaInfo.Nome,
                    Modo: filaInfo.Modo,
                    Valor: filaInfo.Valor,
                })
                await fila.set(`Filas.${selectedValues}.InfosMensagem`, {
                    Mensagem: msgInicial.id,
                    Channel: interaction.channel.id
                })
                await fila.set(`MensagensID.${msgInicial.id}`, {
                    Mensagem: msgInicial.id,
                    Nome: filaInfo.Nome,
                    Modo: filaInfo.Modo,
                    Valor: filaInfo.Valor,
                })


            }
        }
    }
}


