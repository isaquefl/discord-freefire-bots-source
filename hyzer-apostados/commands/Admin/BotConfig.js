const { ApplicationCommandType, Embed, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { perm } = require("../../database");

module.exports = {
    name: "botconfig",
    description: "[🔍 / Owner] Configure o sistema de filas!",
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
        
        await interaction.reply({ content: `**🔄 | Carregando informações...**` })

        setTimeout(() => {

            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `${interaction.guild.name} | Configurações` })
                        .setDescription(`**🎯 | Escolha qual opção deseja configurar!**`)
                        .setTimestamp()
                        .setFooter({ text: `${interaction.guild.name} | Configuração`, iconURL: interaction.user.displayAvatarURL() })

                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_configfilacategory`)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel("Configurar Categoria")
                            .setEmoji("<:engrenagem:1274503349194199131>"),
                        new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_ConfigRoleManuseio`)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel("Configurar Orientador")
                            .setEmoji("<:engrenagem:1274503349194199131>")

                    ),
                    new ActionRowBuilder().addComponents(

                        new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_definirQuantidadeDoranking`)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel("Configurar TOP")
                            .setEmoji("<:gold:1289258295906926726>"),
                        new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_ChannelBlackList`)
                            .setEmoji("<:people:1289541854362075249>")
                            .setLabel("Configurar Logs Blacklist")
                            .setStyle(ButtonStyle.Primary)
                            
                    )

                ],
                content: ""
            })
        }, 1000);
    }
}