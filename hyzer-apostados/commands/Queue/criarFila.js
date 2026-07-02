const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js")
const { fila, perm } = require("../../database/index")

module.exports = {
    name: "criar-fila",
    description: "[👤 / Owner] Crie novas filas.",
    options: [
        {
            name: "nome",
            description: "[📁] Qual será o nome da nova fila ?",
            required: true,
            type: ApplicationCommandOptionType.String
        },
        {
            name: "modo",
            description: "[🌍] Qual será o modo de jogo ?",
            required: true,
            choices: [
                { name: "1 x 1", value: "1" },
                { name: "2 x 2", value: "2" },
                { name: "3 x 3", value: "3" },
                { name: "4 x 4", value: "4" },
                { name: "5 x 5", value: "5" }
            ],
            type: ApplicationCommandOptionType.String
        },
        {
            name: "valor",
            description: "[💸] Qual será o valor da sala ?",
            type: ApplicationCommandOptionType.String,
            required: true

        },
    ],
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
        
        const Valor = await interaction.options.getString("valor")
        const valor = parseInt(Valor, 10);
        if (isNaN(valor)) {
            return interaction.reply({ content: `**❌ • Por favor, insira um número válido para o valor.**`, ephemeral: true });
        }

        await interaction.reply({ content: `**⏰ | Criando modo de jogo...**`, ephemeral: true })
        const Modo = await interaction.options.getString("modo")
        const Nome = await interaction.options.getString("nome")

        if (Modo === "1") {
            await fila.set(`Filas.Fila_${Nome}`, {
                Nome,
                Modo,
                Valor
            })
            await interaction.editReply({
                content: "",
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: "Novo modo de fila criado!", iconURL: "https://media.discordapp.net/attachments/1281912921487704137/1282045772992610405/4214_notify.png?ex=66ddedab&is=66dc9c2b&hm=1e4774c378295dbd0b6bfc0bf5612bf21430254e2e8a409ae838e6c9634ce0b7&=&format=webp&quality=lossless&width=115&height=115" })
                        .setDescription(`**👋 Olá ${interaction.user}. Nova sala criada com sucesso!**\n* **Informações:**\n> **📒 Nome: \`${Nome}\`**\n> **🎯 Modo: \`${Modo} x ${Modo}\`**\n> **💸 Valor: \`${valor}\`**`)
                        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                ]
            })
        }
        if (Modo === "2") {
            await fila.set(`Filas.Fila_${Nome}`, {
                Nome,
                Modo,
                Valor
            })
            await interaction.editReply({
                content: "",
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: "Novo modo de fila criado!", iconURL: "https://media.discordapp.net/attachments/1281912921487704137/1282045772992610405/4214_notify.png?ex=66ddedab&is=66dc9c2b&hm=1e4774c378295dbd0b6bfc0bf5612bf21430254e2e8a409ae838e6c9634ce0b7&=&format=webp&quality=lossless&width=115&height=115" })
                        .setDescription(`**👋 Olá ${interaction.user}. Nova sala criada com sucesso!**\n* **Informações:**\n> **📒 Nome: \`${Nome}\`**\n> **🎯 Modo: \`${Modo} x ${Modo}\`**\n> **💸 Valor: \`${valor}\`**`)
                        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                ]
            })
        }
        if (Modo === "3") {
            await fila.set(`Filas.Fila_${Nome}`, {
                Nome,
                Modo,
                Valor
            })
            await interaction.editReply({
                content: "",
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: "Novo modo de fila criado!", iconURL: "https://media.discordapp.net/attachments/1281912921487704137/1282045772992610405/4214_notify.png?ex=66ddedab&is=66dc9c2b&hm=1e4774c378295dbd0b6bfc0bf5612bf21430254e2e8a409ae838e6c9634ce0b7&=&format=webp&quality=lossless&width=115&height=115" })
                        .setDescription(`**👋 Olá ${interaction.user}. Nova sala criada com sucesso!**\n* **Informações:**\n> **📒 Nome: \`${Nome}\`**\n> **🎯 Modo: \`${Modo} x ${Modo}\`**\n> **💸 Valor: \`${valor}\`**`)
                        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                ]
            })
        }
        if (Modo === "4") {
            await fila.set(`Filas.Fila_${Nome}`, {
                Nome,
                Modo,
                Valor
            })
            await interaction.editReply({
                content: "",
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: "Novo modo de fila criado!", iconURL: "https://media.discordapp.net/attachments/1281912921487704137/1282045772992610405/4214_notify.png?ex=66ddedab&is=66dc9c2b&hm=1e4774c378295dbd0b6bfc0bf5612bf21430254e2e8a409ae838e6c9634ce0b7&=&format=webp&quality=lossless&width=115&height=115" })
                        .setDescription(`**👋 Olá ${interaction.user}. Nova sala criada com sucesso!**\n* **Informações:**\n> **📒 Nome: \`${Nome}\`**\n> **🎯 Modo: \`${Modo} x ${Modo}\`**\n> **💸 Valor: \`${valor}\`**`)
                        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                ]
            })
        }
        if (Modo === "5") {
            await fila.set(`Filas.Fila_${Nome}`, {
                Nome,
                Modo,
                Valor
            })

            await interaction.editReply({
                content: "",
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: "Novo modo de fila criado!", iconURL: "https://media.discordapp.net/attachments/1281912921487704137/1282045772992610405/4214_notify.png?ex=66ddedab&is=66dc9c2b&hm=1e4774c378295dbd0b6bfc0bf5612bf21430254e2e8a409ae838e6c9634ce0b7&=&format=webp&quality=lossless&width=115&height=115" })
                        .setDescription(`**👋 Olá ${interaction.user}. Nova sala criada com sucesso!**\n* **Informações:**\n> **📒 Nome: \`${Nome}\`**\n> **🎯 Modo: \`${Modo} x ${Modo}\`**\n> **💸 Valor: \`${valor}\`**`)
                        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                ]
            })
        }



    }
}