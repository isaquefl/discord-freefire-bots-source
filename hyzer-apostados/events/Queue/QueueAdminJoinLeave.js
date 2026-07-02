const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, escapeHeading } = require("discord.js")
const { admin, payments } = require("../../database/index.js")
const { fila } = require("../../database/index.js");
const { QueueAdmin } = require("../../functions/panelConfig.js");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;

        if (!customId) return;

        if (customId === "entrar_filaAdmin") {
            const orientadorRole = fila.get(`Channels.RoleOrientador`);
            const cara = interaction.guild.members.cache.get(interaction.user.id);
            const typeChave = await payments.get(`${interaction.user.id}.Type`)
            if (!typeChave) {
                return interaction.reply({ content: "**🔔 | Antes de iniciar, configure seu método de receber pagamentos.**", ephemeral:true })
            }
            if (!orientadorRole) {
                return interaction.reply({ content: `**🔔 | Aguarde que o dono configure tudo corretamente!**`, ephemeral:true })
            }
            if (!cara.roles.cache.has(orientadorRole)) {
                return interaction.reply({ content: `**🔔 | Você não possui o cargo de orientador...**`, ephemeral:true })
            }
            const verifykk = await admin.get(`${interaction.user.id}`)
            if (verifykk === `${interaction.user.id}`) {
                await interaction.reply({ content: `**🔍 | Erro ao tentar entrar na fila, pois você já está nela.**`, ephemeral: true })
                return;
            } else {
                await admin.set(`${interaction.user.id}`, interaction.user.id)
                await QueueAdmin(interaction, client)
            }


        }
        if (customId === "sair_filaAmidn") {
            const orientadorRole = fila.get(`Channels.RoleOrientador`);
            const cara = interaction.guild.members.cache.get(interaction.user.id);
            if (!orientadorRole) {
                return interaction.reply({ content: `**❌ | Aguarde que o dono configure tudo corretamente!**`, ephemeral:true })
            }
            if (!cara.roles.cache.has(orientadorRole)) {
                return interaction.reply({ content: `**❌ | Você não possui o cargo de orientador...**`, ephemeral:true })
            }

            const verifykk = await admin.get(`${interaction.user.id}`)
            if (verifykk === `${interaction.user.id}`) {
                await admin.delete(`${interaction.user.id}`)
                await QueueAdmin(interaction, client)
            } else {
                await interaction.reply({ content: `**🔍 | Erro ao tentar sair da fila, pois você já está mais participando dela.**`, ephemeral: true })
            }
        }


    }
}