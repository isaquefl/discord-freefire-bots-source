const { ApplicationCommandType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { fila, perm } = require("../../database/index");

module.exports = {
    name: "set-fila",
    description: "[👤 / Owner] Set de filas existentes!",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        const ownerId = require("../../token.json").owner;
        const verifyPerm = await perm.get(interaction.user.id);
        
        if (interaction.user.id !== ownerId && interaction.user.id !== verifyPerm) {
            return interaction.reply({
                content: `**❌ ・ Você não possui permissão para utilizar este comando.**`,
                ephemeral: true,
            });
        }
        
        const infos = await fila.get(`Filas`);
        if (!infos) return interaction.reply({
            content: `❌ | Você não adicionou nenhuma fila, crie uma!`,
            ephemeral: true
        });
        const infosArray = Object.entries(infos);
        if (infosArray.length > 0) {

            try {
                const select = new StringSelectMenuBuilder()
                    .setCustomId('optionsFilasConfig')
                    .setPlaceholder("Selecione a fila que deseja setar!");

                await infosArray.map((a) => {
                    const { Modo, Nome, Valor } = a[1];
                    const id = a[0];
                    select.addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(Nome)
                            .setDescription(`${Modo} x ${Modo} - Valor: R$${Valor}`)
                            .setEmoji("🔍")
                            .setValue(id)
                    )
                });

                const selectTicket = new ActionRowBuilder().addComponents(select);
                const msg = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: `Setagem de filas!`, iconURL: "https://media.discordapp.net/attachments/1254213255593725982/1282354074523537458/8005-spotify-queue-add.png?ex=66df0ccc&is=66ddbb4c&hm=4c49a2336cedf88c11fb04756b12758ca19adda2119f1892dd05c99694d6597e&=&format=webp&quality=lossless&width=230&height=230" })
                            .setDescription(`👋 Olá ${interaction.user}. Seleciona o modelo de fila que deseja setar!`)
                            .setFooter({ text: `Selecione a opção que deseja setar!`, iconURL: `${interaction.guild.iconURL()}` })
                    ],
                    components: [selectTicket],
                    ephemeral: true
                })
                if (msg) {
                    setTimeout(() => {
                        interaction.editReply({ embeds: [], components: [], content: `**📢 | Tempo de uso excedido!\n> Use o comando novamente.**` })
                    }, 60000)
                }
            } catch (e) {
                console.log(e)
            }


        }
    }
}
