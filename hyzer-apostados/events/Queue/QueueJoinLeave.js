const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, permissionOverwrites } = require("discord.js");
const { fila, admin, payments } = require("../../database/index");
const { UpdatePayments } = require("../../functions/panelConfig");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;

        if (!customId) return;
        const genProtocol = (length) => {
            let result = '';
            const charset = "1234567890";
            for (let i = 0; i < length; i++) {
                result += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return result;
        };

        if (customId === "entrar_fila") {
            const filaInfo = await fila.get(`MensagensID.${interaction.message.id}`);
            // M
            const user1 = await fila.get(`MensagensID.${interaction.message.id}.User1`);
            const user2 = await fila.get(`MensagensID.${interaction.message.id}.User2`);
            const filaInfoName = await fila.get(`MensagensID.${interaction.message.id}.Nome`);
            const Verify = (await admin.all())[0];
            if (!Verify) {
                return await interaction.reply({ content: `**❌ | Não há orientadores presentes!**`, ephemeral: true })
            }

            if (!user1) {
                await fila.set(`MensagensID.${interaction.message.id}.User1`, interaction.user.id);
                await interaction.reply({ content: `**🔍 | Você acaba de entrar na fila \`\`${filaInfoName}\`\`.**`, ephemeral: true });
            } else if (user1 === interaction.user.id || user2 === interaction.user.id) {
                await interaction.reply({ content: `**❌ | Você não pode entrar duas vezes na mesma fila \`\`${filaInfoName}\`\`.**`, ephemeral: true });
            } else if (!user2) {
                await fila.set(`MensagensID.${interaction.message.id}.User2`, interaction.user.id);
                await interaction.reply({ content: `**🔍 | Você acaba de entrar na fila \`\`${filaInfoName}\`\`.**`, ephemeral: true });
            } else {
                await interaction.reply({ content: `**❌ | A fila \`\`${filaInfoName}\`\` já está cheia.**`, ephemeral: true });
            }
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Hyzer Apostados 0% DE TAXA" })
                .setDescription(`\n<:jogar:1329271365672505384> | **Modo: \`${filaInfo.Modo} x ${filaInfo.Modo} ${filaInfo.Nome}\`**\n**<:dinheiro:1329271641586405518> | Valor: \`\`R$${filaInfo.Valor}\`\`**\n<:user:1329271763447709768> | **Jogadores:** \`Sem jogadores.\``)
                .setColor("#FF0000")
                .setTimestamp()
                .setThumbnail(`${client.user.displayAvatarURL()}`)
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });


            const user1Dnv = await fila.get(`MensagensID.${interaction.message.id}.User1`);
                const user2Dnv = await fila.get(`MensagensID.${interaction.message.id}.User2`);

            if (user1Dnv) {
                embed.addFields(
                    { name: `<:user:1329271763447709768> | Jogador 1:`, value: `<@${user1Dnv}>`, inline: true }
                )
                embed.setDescription(`\n<:jogar:1329271365672505384> | **Modo: \`${filaInfo.Modo} x ${filaInfo.Modo} ${filaInfo.Nome}\`**\n**<:dinheiro:1329271641586405518>| Valor: \`\`R$${filaInfo.Valor}\`\`**`)
            }
            if (user2Dnv) {
                embed.addFields(
                    { name: `<:user:1329271763447709768> | Jogador 2:`, value: `<@${user2Dnv}>`, inline: true }
                )
            }
            const channelEdit = interaction.channel;
            const message = await channelEdit.messages.fetch(interaction.message.id);
            await message.edit({
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
            if (user2Dnv) {
                const user1 = await fila.get(`MensagensID.${interaction.message.id}.User1`);
                const user2 = await fila.get(`MensagensID.${interaction.message.id}.User2`);
                const category = await fila.get(`Channels.categoryAbertura`)
                const data = (await admin.all())[0];

                const permissionOverwrites = [
                    {
                        id: data.ID,
                        allow: ["ViewChannel", "SendMessages", "AttachFiles"]
                    },
                    {
                        id: interaction.client.user.id,
                        allow: ["ViewChannel", "SendMessages", "AttachFiles"]
                    },
                    {
                        id: user1,
                        allow: ["ViewChannel", "SendMessages", "AttachFiles"]
                    },
                    {
                        id: user2,
                        allow: ["ViewChannel", "SendMessages", "AttachFiles"]
                    },
                    {
                        id: interaction.guild.id,
                        deny: ["ViewChannel", "SendMessages", "AttachFiles"]
                    }
                ];


                const channel = await interaction.guild.channels.create({
                    name: `Aguardando-Fila-${filaInfo.Nome}`,
                    type: ChannelType.GuildText,
                    topic: `Fila - ${filaInfo.Nome}`,
                    parent: category,
                    permissionOverwrites,
                });
                fila.set(`Channels.SaveInfoChannel.${channel.id}`, {
                    Nome: filaInfo.Nome,
                    User1: user1,
                    User2: user2,
                    Modo: filaInfo.Modo,
                    Valor: filaInfo.Valor,
                    Orientador: data.ID,
                });
                const id = data.ID;
                admin.delete(id)
                try {
                    const messageData = await fila.get(`MensagensID`);
                    const messageEdit = messageData?.MensagensIDPanel;
                    const messageChannel = interaction.guild.channels.cache.get(messageData?.ChannelIDPanel);
                    if (messageEdit && messageChannel) {

                        const messageEditt = await messageChannel.messages.fetch(messageEdit);
                        if (messageEditt) {
                            const orientadornovamente = await fila.get(`Channels.SaveInfoChannel.${channel.id}.Orientador`)
                            await admin.set(`${orientadornovamente}`, orientadornovamente)
                            let msg = "";
                            const all = await admin.all();
                            all.map((rs, index) => {
                                msg += ` **\`${index + 1}°\` | <@${rs.ID}> - \`${rs.ID}\`**\n`;
                            });
                            await messageEditt.edit({
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
                                            .setEmoji("✅")
                                            .setStyle(ButtonStyle.Success),
                                        new ButtonBuilder()
                                            .setCustomId("sair_filaAmidn")
                                            .setStyle(ButtonStyle.Danger)
                                            .setLabel("Sair de serviço")
                                            .setEmoji("❌")
                                    )
                                ]

                            })
                        } else {
                            console.error(`❌ | Mensagem do painel admin não encontrada no canal.`);
                        }
                    }
                } catch (e) { }
                await fila.delete(`MensagensID.${interaction.message.id}.User1`)
                await fila.delete(`MensagensID.${interaction.message.id}.User2`)
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Hyzer Apostados 0% DE TAXA" })
                    .setDescription(`\n<:jogar:1329271365672505384> | **Modo: \`${filaInfo.Modo} x ${filaInfo.Modo} ${filaInfo.Nome}\`**\n**<:dinheiro:1329271641586405518> | Valor: \`\`R$${filaInfo.Valor}\`\`**\n<:user:1329271763447709768> | **Jogadores:** \`Sem jogadores.\``)
                    .setColor("#FF0000")
                    .setTimestamp()
                    .setThumbnail(`${client.user.displayAvatarURL()}`)
                    .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });


                const user1Dnv = await fila.get(`MensagensID.${interaction.message.id}.User1`);
                const user2Dnv = await fila.get(`MensagensID.${interaction.message.id}.User2`);

                if (user1Dnv) {
                    embed.addFields(
                        { name: `<:user:1329271763447709768> | Jogador 1:`, value: `<@${user1Dnv}>`, inline: true }
                    )
                    embed.setDescription(`\n<:jogar:1329271365672505384> | **Modo: \`${filaInfo.Modo} x ${filaInfo.Modo} ${filaInfo.Nome}\`**\n**<:dinheiro:1329271641586405518> | Valor: \`\`R$${filaInfo.Valor}\`\`**`)
                }
                if (user2Dnv) {
                    embed.addFields(
                        { name: `<:user:1329271763447709768> | Jogador 2:`, value: `<@${user2Dnv}>`, inline: true }
                    )
                }
                const channel2 = interaction.channel;
                const message = await channel2.messages.fetch(interaction.message.id);
                await message.edit({
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
                const user1content = await fila.get(`Channels.SaveInfoChannel.${channel.id}.User1`)
                const user2content = await fila.get(`Channels.SaveInfoChannel.${channel.id}.User2`)
                const formateChannel = await fila.get(`Channels.SaveInfoChannel.${channel.id}.Modo`)
                const ValorChannel = await fila.get(`Channels.SaveInfoChannel.${channel.id}.Valor`)
                channel.send({
                    content: `<@${user1content}>, <@${user2content}>`,
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: "Confirmação!" })
                            .setThumbnail(client.user.displayAvatarURL())
                            .setDescription(`**Formato: \`\`${formateChannel} x ${formateChannel}\`\`**\n**Valor: \`\`R$${ValorChannel}\`\`**`)
                            .setFooter({ text: `Confirme para jogar.` })
                            .setColor("Red")
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`confirmarfila`)
                                .setEmoji(`✅`)
                                .setLabel("Confirmar")
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId("recusarfila")
                                .setEmoji(`❌`)
                                .setStyle(ButtonStyle.Danger)
                                .setLabel("Recusar")
                        )
                    ]
                })
            }




        }
        if (customId === "sair_fila") {
            const user1del = await fila.get(`MensagensID.${interaction.message.id}.User1`);
            const user2del = await fila.get(`MensagensID.${interaction.message.id}.User2`);
            const filaInfoName = await fila.get(`MensagensID.${interaction.message.id}.Nome`);

            if (user1del === interaction.user.id) {
                await fila.delete(`MensagensID.${interaction.message.id}.User1`)
                await interaction.reply({ content: `**🎯 | Saida confirmada com sucesso da sala \`\`${filaInfoName}\`\`.**`, ephemeral: true })
            } else if (user2del === interaction.user.id) {
                await fila.delete(`MensagensID.${interaction.message.id}.User2`)
                await interaction.reply({ content: `**🎯 | Saida confirmada com sucesso da sala \`\`${filaInfoName}\`\`.**`, ephemeral: true })
            } else {
                await interaction.reply({ content: `**❌ | Você não tem presença confirmada na sala \`\`${filaInfoName}\`\`.**`, ephemeral: true })
            }

            const user1 = await fila.get(`MensagensID.${interaction.message.id}.User1`);
            const user2 = await fila.get(`MensagensID.${interaction.message.id}.User2`);
            const filaInfo = await fila.get(`MensagensID.${interaction.message.id}`);

            const embed = new EmbedBuilder()
                .setAuthor({ name: "Hyzer Apostados 0% DE TAXA" })
                .setDescription(`\n<:jogar:1329271365672505384> | **Modo: \`${filaInfo.Modo} x ${filaInfo.Modo} ${filaInfo.Nome}\`**\n**<:dinheiro:1329271641586405518>| Valor: \`\`R$${filaInfo.Valor}\`\`**\n<:user:1329271763447709768> | **Jogadores:** \`Sem jogadores.\``)
                .setColor("#FF0000")
                .setTimestamp()
                .setThumbnail(`${client.user.displayAvatarURL()}`)
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });

            if (user1) {
                embed.addFields(
                    { name: `<:user:1329271763447709768> | Jogador 1:`, value: `<@${user1}>`, inline: true }
                )
                embed.setDescription(`\n<:jogar:1329271365672505384> | **Modo: \`${filaInfo.Modo} x ${filaInfo.Modo} ${filaInfo.Nome}\`**\n**<:dinheiro:1329271641586405518> | Valor: \`\`R$${filaInfo.Valor}\`\`**`)
            }
            if (user2) {
                embed.addFields(
                    { name: `<:user:1329271763447709768> | Jogador 2:`, value: `<@${user2}>`, inline: true }
                )
            }
            const channelEdit = await interaction.channel;
            const message = await channelEdit.messages.fetch(interaction.message.id);
            await message.edit({
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


        }
        if (customId === "recusarfila") {
            const User1 = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User1`)
            const User2 = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User2`)
            if (interaction.user.id !== User1 && interaction.user.id !== User2) {
                return await interaction.reply({ content: `**❌ | Você não é o jogador.**`, ephemeral: true })
            }
            const orientador = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Orientador`)
            await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                ViewChannel: false,
                SendMessages: false
            })
            await interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `Abandono de fila...`, iconURL: `https://media.discordapp.net/attachments/1281912921487704137/1287221127311134741/manager.png?ex=66f0c198&is=66ef7018&hm=8d681d0d9cac0b6831534be4a9df71160a67048f3523a87af00daac0ae621c48&=&format=webp&quality=lossless&width=86&height=86` })
                        .setDescription(`**🔍 Olá <@${orientador}>, ${interaction.user} acaba de deixar a fila! **`)
                        .setTimestamp()
                        .setFooter({ text: `${interaction.user.tag} Saiu da fila!`, iconURL: `${interaction.user.displayAvatarURL()}` })
                ],
                components: []
            })
                          await interaction.reply({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);
            }
        
        if (customId === "confirmarfila") {

            const User1 = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User1`);
            const User2 = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User2`);
            const User1Confirmou = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User1Confirmou`);
            const User2Confirmou = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User2Confirmou`);
            const Nome = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Nome`);

            if (interaction.user.id !== User1 && interaction.user.id !== User2) {
                return await interaction.reply({ content: `**❌ | Você não é o jogador.**`, ephemeral: true });
            } else if (interaction.user.id === User1Confirmou || interaction.user.id === User2Confirmou) {
                return await interaction.reply({ content: `**❌ | Você já confirmou esta rodada!**`, ephemeral: true });
            } else if (!User1Confirmou) {
                await fila.set(`Channels.SaveInfoChannel.${interaction.channel.id}.User1Confirmou`, interaction.user.id);

                await interaction.channel.send({ content: `**👋 ${interaction.user} Confirmou o jogo!**` });
                return await interaction.reply({ content: `**🛜 | Jogo confirmado com sucesso!**`, ephemeral: true })
            } else if (!User2Confirmou) {
                await interaction.channel.send({ content: `**👋 ${interaction.user} Confirmou o jogo!**` });
                await fila.set(`Channels.SaveInfoChannel.${interaction.channel.id}.User2Confirmou`, interaction.user.id);
                const messages = await interaction.channel.messages.fetch({ limit: 10 });
                // Protocol
                const proto = genProtocol(5)
                await interaction.channel.setName(`${Nome}-${proto}`)
                await interaction.channel.bulkDelete(messages, true);
                setTimeout(() => {
                    UpdatePayments(interaction, client);
                }, 8000);
                return await interaction.reply({ content: `**🛜 | Jogo confirmado com sucesso!**`, ephemeral: true });
            }
        }
    }
}