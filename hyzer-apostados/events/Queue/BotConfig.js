const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, UserSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js")
const { fila, admin, ranking, rankingConfig, taxados, perm, payments } = require("../../database/index")
const { ConfigCategoryk, painel, configOrientador, PainelChamda, recaptchaPanelChamada, finalParty, ConfigTopRanking, ConfigChannelBlackList, VoltarPerms } = require("../../functions/panelConfig")
module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;

        if (!customId) return;
        const orientador = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Orientador`)

        if (customId === `${interaction.user.id}_configfilacategory`) {
            ConfigCategoryk(interaction)
        };
        if (customId === `${interaction.user.id}_ConfigCategory`) {
            await interaction.update({
                embeds: [],
                content: "",
                components: [
                    new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId(`${interaction.user.id}_SelectConfigCategory`)
                            .setMaxValues(1)
                            .setPlaceholder("🔍 - Defina a categoria!")
                            .setChannelTypes(ChannelType.GuildCategory)
                    )
                ]
            })
        };
        if (customId === `${interaction.user.id}_SelectConfigCategory`) {
            if (interaction.values && interaction.values.length > 0) {
                await fila.set(`Channels.categoryAbertura`, interaction.values[0])
                await ConfigCategoryk(interaction)


            }
        };
        if (customId === `${interaction.user.id}_VoltarConfigCategory`) {
            await painel(interaction)
        };
        if (customId === `${interaction.user.id}_ConfigRoleManuseio`) {
            await configOrientador(interaction)
        };
        if (customId === `${interaction.user.id}_ConfigRoleManuseioSelect`) {
            await interaction.update({
                embeds: [],
                content: "",
                components: [
                    new ActionRowBuilder().addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId(`${interaction.user.id}_ConfigRoleManuseioSelectSet`)
                            .setMaxValues(1)
                            .setPlaceholder("🔍 - Defina o cargo!")
                    )
                ]
            })
        };
        if (customId === `${interaction.user.id}_ConfigRoleManuseioSelectSet`) {
            if (interaction.values && interaction.values.length > 0) {
                await fila.set(`Channels.RoleOrientador`, interaction.values[0])
                await configOrientador(interaction);
            }
        };
        if (
            (interaction.isStringSelectMenu() && customId === "optionsFilasDel") ||
            (interaction.isButton() && await fila.get(`Filas`))
        ) {
            if (interaction.isStringSelectMenu()) {
                await interaction.reply({ content: `**🛜 | Carregando informações...**`, ephemeral: true })

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
                await fila.delete(`Filas.${selectedValues}`)
                await interaction.editReply({ content: `**🔍 | Informações encontradas, painel deletado.**`, ephemeral: true })

            }
        };
        if (interaction.isStringSelectMenu() && interaction.customId === "selectOptionsFila") {
            const options = interaction.values[0];


            if (options === "painelcall") {
                const orientador = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Orientador`)
                if (interaction.user.id !== orientador) {
                    return await interaction.reply({ content: `**❌ | Você não tem permissão para isto!**`, ephemeral: true })
                }
                await PainelChamda(interaction, client)

            }

            if (options === "finalizarparty") {
                const canalName = interaction.channel.name;
                const verify = interaction.guild.channels.cache.find(a => a.name === `📞・${canalName}`);
                const orientador = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Orientador`)
                if (interaction.user.id !== orientador) {
                    return await interaction.reply({ content: `**❌ | Você não é o orientador!**`, ephemeral: true })
                }
                await interaction.reply({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                    await recaptchaPanelChamada(interaction, client)

                }
            }
            if (options === "definirvencedoresparty") {
                const orientador = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Orientador`)
                if (interaction.user.id !== orientador) {
                    return await interaction.reply({ content: `**❌ | Você não é o orientador!**`, ephemeral: true })
                }
                const a = new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                            .setCustomId(`${orientador}_customidSetVencedor`)
                            .setMaxValues(1)
                            .setMinValues(1)
                            .setPlaceholder("Escolha o vencedor!")
                    );

                await interaction.reply({ content: "", components: [a], ephemeral: true });
            }
        }
        if (customId === "criarcallButton") {
            const category = await fila.get(`Channels.categoryAbertura`)
            const user1 = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User1`);
            const user2 = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User2`);
            const permissionOverwrites = [
                {
                    id: interaction.user.id,
                    allow: ["Connect", "ViewChannel", "SendMessages", "AttachFiles"]
                },
                {
                    id: interaction.guild.id,
                    deny: ["Connect", "ViewChannel", "SendMessages", "AttachFiles"]
                },
                {
                    id: user1,
                    allow: ["Connect", "ViewChannel", "SendMessages", "AttachFiles"]
                },
                {
                    id: user2,
                    allow: ["Connect", "ViewChannel", "SendMessages", "AttachFiles"]
                }
            ]
            const channel = await interaction.guild.channels.create({
                name: `📞・${interaction.channel.name}`,
                type: ChannelType.GuildVoice,
                parent: category,
                permissionOverwrites,
            });
            await recaptchaPanelChamada(interaction, client)
        };
        if (customId === "deletarcallButton") {
            const canalName = interaction.channel.name;
            const verify = interaction.guild.channels.cache.find(a => a.name === `📞・${canalName}`);

            if (!verify) return;

            if (verify) {
                await verify.delete().catch(e => { return console.log(e); })
                await recaptchaPanelChamada(interaction, client)

            }
        };
        if (customId === `${orientador}_customidSetVencedor`) {
            const options = interaction.values[0];
            /*const number1 = await ranking.get(`${interaction.values[0]}`);*/
            await fila.set(`Channels.SaveInfoChannel.${interaction.channel.id}.UserVencedor`, interaction.values[0])

            await interaction.update({
                embeds: [],
                comtent: "",
                components: [
                    new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("selecionarultimospontinhos_select")
                            .setPlaceholder("Seleciona a pontuação!")
                            .setMaxValues(1)
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 1 Ponto!")
                                    .setEmoji("1️⃣")
                                    .setDescription("Atribuir 1 ponto ao jogador!")
                                    .setValue("1ponto"),

                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 2 Pontos!")
                                    .setEmoji("2️⃣")
                                    .setDescription("Atribuir 2 pontos ao jogador!")
                                    .setValue("2pontos"),

                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 3 Pontos!")
                                    .setEmoji("3️⃣")
                                    .setDescription("Atribuir 3 pontos ao jogador!")
                                    .setValue("3pontos"),

                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 4 Pontos!")
                                    .setEmoji("4️⃣")
                                    .setDescription("Atribuir 4 pontos ao jogador!")
                                    .setValue("4pontos"),

                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 5 Pontos!")
                                    .setEmoji("5️⃣")
                                    .setDescription("Atribuir 5 pontos ao jogador!")
                                    .setValue("5pontos"),

                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 6 Pontos!")
                                    .setEmoji("6️⃣")
                                    .setDescription("Atribuir 6 pontos ao jogador!")
                                    .setValue("6pontos"),

                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 7 Pontos!")
                                    .setEmoji("7️⃣")
                                    .setDescription("Atribuir 7 pontos ao jogador!")
                                    .setValue("7pontos"),

                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 8 Pontos!")
                                    .setEmoji("8️⃣")
                                    .setDescription("Atribuir 8 pontos ao jogador!")
                                    .setValue("8pontos"),

                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 9 Pontos!")
                                    .setEmoji("9️⃣")
                                    .setDescription("Atribuir 9 pontos ao jogador!")
                                    .setValue("9pontos"),

                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Dar 10 Pontos!")
                                    .setEmoji("🔟")
                                    .setDescription("Atribuir 10 pontos ao jogador!")
                                    .setValue("10pontos"),

                            )
                    )
                ]

            })
        };
        if (interaction.isStringSelectMenu() && interaction.customId === "selecionarultimospontinhos_select") {
            const options = interaction.values[0];
            const canalName = interaction.channel.name;
            const verify = interaction.guild.channels.cache.find(a => a.name === `📞・${canalName}`);
            const user = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.UserVencedor`);
            const pontuacaoAtual = await ranking.get(user);

            if (options === "1ponto") {
                await ranking.set(user, pontuacaoAtual + 1)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }

            }
            if (options === "2pontos") {
                await ranking.set(user, pontuacaoAtual + 2)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }
            }
            if (options === "3pontos") {
                await ranking.set(user, pontuacaoAtual + 3)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }
            }
            if (options === "4pontos") {
                await ranking.set(user, pontuacaoAtual + 4)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }
            }
            if (options === "5pontos") {
                await ranking.set(user, pontuacaoAtual + 5)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }
            }
            if (options === "6pontos") {
                await ranking.set(user, pontuacaoAtual + 6)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }
            }
            if (options === "7pontos") {
                await ranking.set(user, pontuacaoAtual + 7)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }
            }
            if (options === "8pontos") {
                await ranking.set(user, pontuacaoAtual + 8)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }
            }
            if (options === "9pontos") {
                await ranking.set(user, pontuacaoAtual + 9)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }
            }
            if (options === "10pontos") {
                await ranking.set(user, pontuacaoAtual + 10)
                await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })
                await finalParty(interaction, client)
                await interaction.channel.send({ content: `**🔔 | Fila sendo deletada em 5 segundos...**` })
                setTimeout(() => {
                    interaction.channel.delete().catch(e => { return; })

                }, 5000);

                if (!verify) return;

                if (verify) {
                    await verify.delete().catch(e => { return; })
                }
            }

        };
        if (customId === `${interaction.user.id}_definirQuantidadeDoranking`) {
            await ConfigTopRanking(interaction, client)

        };
        if (customId === `${interaction.user.id}_IrParaModalConfigRank`) {
            const modal = new ModalBuilder()
                .setCustomId("modalPeoplesRank")
                .setTitle("🛜 - Qual será a nova quantidade ?")

            const type = new TextInputBuilder()
                .setCustomId("valorPeoplesModal")
                .setLabel("Digite aqui o novo número do top rank!")
                .setPlaceholder("Ex: 10")
                .setStyle(1)
                .setMinLength(1)
                .setRequired(true)

            const infos = new ActionRowBuilder().addComponents(type)
            modal.addComponents(infos)

            await interaction.showModal(modal)
        };
        if (customId === "modalPeoplesRank") {
            const type = await interaction.fields.getTextInputValue("valorPeoplesModal")
            const valor = parseInt(type, 10);
            if (isNaN(valor)) {
                return interaction.reply({ content: `**❌ • Por favor, insira um número válido para o rank.**`, ephemeral: true });
            }
            await rankingConfig.set(`RankingPeople`, type)
            await ConfigTopRanking(interaction, client)
        };
        if (customId === `${interaction.user.id}_ChannelBlackList`) {
            await ConfigChannelBlackList(interaction, client)
        };
        if (customId === `${interaction.user.id}_ChannelBlackListButton2`) {
            await interaction.update({
                embeds: [],
                content: "",
                components: [
                    new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId(`${interaction.user.id}_ChannelBlackListSelect`)
                            .setPlaceholder("Selecione o canal!")
                            .setMaxValues(1)
                            .setChannelTypes(ChannelType.GuildText)
                    )
                ]
            })
        };
        if (customId === `${interaction.user.id}_ChannelBlackListSelect`) {
            const options = interaction.values[0]
            await fila.set(`Channels.ChannelBlackList`, options)
            await ConfigChannelBlackList(interaction, client)
        };
        if (customId === `${interaction.user.id}_DarBlackListButton`) {
            const modal = new ModalBuilder()
                .setCustomId("modalAddBlackList")
                .setTitle("🔍 - Adicionar Usuário à Blacklist!")

            const nome = new TextInputBuilder()
                .setCustomId("nomeAddBlackList")
                .setLabel("Qual é o nome do usuário ?")
                .setMaxLength(20)
                .setMinLength(2)
                .setPlaceholder("Ex: WhiteX")
                .setRequired(true)
                .setStyle(1);

            const Discord = new TextInputBuilder()
                .setCustomId("dcIDAddBlackList")
                .setLabel("Qual é o ID do discord ?")
                .setMaxLength(30)
                .setPlaceholder("Ex: 1249650199006281773")
                .setMinLength(10)
                .setRequired(true)
                .setStyle(1);

            const IDGame = new TextInputBuilder()
                .setCustomId("GameIDAddBlackList")
                .setLabel("Qual é o ID dentro do game ?")
                .setMaxLength(60)
                .setPlaceholder("Ex: 62875162")
                .setMinLength(3)
                .setRequired(true)
                .setStyle(1)

            const motivo = new TextInputBuilder()
                .setCustomId("motivoAddBlackLIst")
                .setLabel("Qual é o motivo da Blacklist?")
                .setMaxLength(1000)
                .setStyle(2)
                .setPlaceholder("Ex: Deu 3 Capas do Nobru Suspeitamente!")
                .setRequired(true)
                .setMinLength(3)

            const Provas = new TextInputBuilder()
                .setCustomId("provasAddBlackList")
                .setLabel("Qual é a prova da Blacklist?")
                .setMaxLength(500)
                .setPlaceholder("Ex: https://discord.dev")
                .setRequired(true)
                .setStyle(1)
            const infos = new ActionRowBuilder().addComponents(nome)
            const infos2 = new ActionRowBuilder().addComponents(Discord)
            const infos3 = new ActionRowBuilder().addComponents(IDGame)
            const infos4 = new ActionRowBuilder().addComponents(Provas)
            const infos5 = new ActionRowBuilder().addComponents(motivo)
            modal.addComponents(infos, infos2, infos3, infos5, infos4)

            await interaction.showModal(modal)

        };
        if (customId === "modalAddBlackList") {
            const name = await interaction.fields.getTextInputValue("nomeAddBlackList");
            const discordID = await interaction.fields.getTextInputValue("dcIDAddBlackList");
            const gameID = await interaction.fields.getTextInputValue("GameIDAddBlackList");
            const provaLink = await interaction.fields.getTextInputValue("provasAddBlackList");
            const motivo = await interaction.fields.getTextInputValue("motivoAddBlackLIst");

            const channel = await fila.get(`Channels.ChannelBlackList`);
            const SearchChannel = await interaction.guild.channels.cache.get(channel);
            const SearchUser = await interaction.client.users.cache.get(discordID);

            const verify = await taxados.get(`${gameID}`);
            if (verify) {
                return await interaction.reply({ content: `**🔔 | Usuário de Game ID: \`${gameID}\` Já na BlackList!**`, ephemeral: true });
            };
            if (!provaLink.startsWith("https://") && !provaLink.startsWith("http://")) {
                interaction.reply({ content: "**🔔 | Forneça um link válido!**", ephemeral: true })
            }
            await taxados.set(`${gameID}`, {
                Nome: name,
                Responsavel: interaction.user.id,
                DiscordID: discordID,
                GameID: gameID,
                Motivo: motivo,
                Provas: provaLink
            })
            await interaction.reply({ content: `**🎯 | Usuário adicionado a blacklist com sucesso!**`, ephemeral: true })
            if (!channel) return;
            const embed = new EmbedBuilder()
            if (SearchUser) {
                embed.setAuthor({ name: `${SearchUser.username}`, iconURL: `${SearchUser.displayAvatarURL()}` })
                embed.setThumbnail(SearchUser.displayAvatarURL())
            } else {
                embed.setTitle(`🔔・Novo trapaceiro adicionado em nossa BlackList!`);
            };
            embed.setDescription(`- **Nome do indivíduo: ${name}**\n- **Infos Discord: <@${discordID}> - \`\`${discordID}\`\`**\n- **ID em Game: \`\`${gameID}\`\`**\n- **Motivo: \`\`${motivo}\`\`**\n- **Provas: ${provaLink}**\n- **Responsável: ${interaction.user} - \`\`${interaction.user.id}\`\`**`);
            embed.setTimestamp();
            embed.setColor("Green");
            embed.setFooter({ text: 'Novo Usuário Adicionado à BlackList!', iconURL: client.user.displayAvatarURL() });
            if (channel) {
                SearchChannel.send({
                    embeds: [embed]
                });
            };

        };
        if (customId === `${interaction.user.id}_RemoverBlackListButton`) {
            const modal = new ModalBuilder()
                .setCustomId("ModalRemoveBlacklist")
                .setTitle("🔍 - Remover Blacklist!");

            const IDGame = new TextInputBuilder()
                .setCustomId("GameIDRemoveBlackList")
                .setLabel("Qual é o ID dentro do game ?")
                .setMaxLength(60)
                .setPlaceholder("Ex: 62875162")
                .setMinLength(3)
                .setRequired(true)
                .setStyle(1);

            const motivo = new TextInputBuilder()
                .setCustomId("motivoRemoveBlackLIst")
                .setLabel("Qual é o motivo da remoção da Blacklist?")
                .setMaxLength(1000)
                .setStyle(2)
                .setPlaceholder("Ex: Ele não teve culpa do ocorrido!")
                .setRequired(true)
                .setMinLength(3);

            const Provas = new TextInputBuilder()
                .setCustomId("provasRemoveBlackList")
                .setLabel("Qual é a contraprova da Blacklist?")
                .setMaxLength(500)
                .setPlaceholder("Ex: https://discord.dev")
                .setRequired(true)
                .setStyle(1);

            modal.addComponents(new ActionRowBuilder().addComponents(IDGame));
            modal.addComponents(new ActionRowBuilder().addComponents(motivo));
            modal.addComponents(new ActionRowBuilder().addComponents(Provas));

            await interaction.showModal(modal);
        };
        if (customId === "ModalRemoveBlacklist") {
            const IdGame = await interaction.fields.getTextInputValue("GameIDRemoveBlackList");
            const MotivoRemove = await interaction.fields.getTextInputValue("motivoRemoveBlackLIst");
            const ProvasNovas = await interaction.fields.getTextInputValue("provasRemoveBlackList");
            const IdGameSearch = await taxados.get(`${IdGame}`)

            const channel = await fila.get(`Channels.ChannelBlackList`);
            const SearchChannel = await interaction.guild.channels.cache.get(channel);

            if (!ProvasNovas.startsWith("https://") && !provaLink.startsWith("http://")) {
                interaction.reply({ content: "**🔔 | Forneça um link válido!**", ephemeral: true })
            };
            const verify = await taxados.get(`${IdGame}`);
            if (!verify) {
                return await interaction.reply({ content: `**🔔 | Usuário de Game ID: \`${IdGame}\` não está na BlackList!**`, ephemeral: true });
            } else if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle(`🔔・Novo Trapaceiro removido da BlackList!`)
                    .setTimestamp()
                    .setColor("Green")
                    .setDescription(`- **Nome do indivíduo: ${IdGameSearch.Nome}**\n- **Infos Discord: <@${IdGameSearch.DiscordID}> - \`\`${IdGameSearch.DiscordID}\`\`**\n- **ID em Game: \`\`${IdGame}\`\`**\n- **Motivo Da Blacklist: \`\`${IdGameSearch.Motivo}\`\`**\n- **Provas da Blacklist: ${IdGameSearch.Provas}**\n- **Responsável Blacklist: <@${IdGameSearch.Responsavel}> - \`\`${IdGameSearch.Responsavel}\`\`**\n\n- **Motivo Recorrência: \`\`${MotivoRemove}\`\`**\n- **Provas Recorrência: ${ProvasNovas}**\n- **Responsável pela remoção: ${interaction.user} - \`\`${interaction.user.id}\`\`**`)
                    .setFooter({ text: `Novo Usuário Removido da BlackList!`, iconURL: client.user.displayAvatarURL() })
                if (SearchChannel) {
                    await SearchChannel.send({
                        embeds: [
                            embed
                        ]
                    });
                };
            };
            await interaction.reply({ content: `**🎯 | Usuário removido da blacklist com sucesso!**`, ephemeral: true })
            await taxados.delete(`${IdGame}`)
        };
        if (customId === "pesquisarusuário") {
            const modal = new ModalBuilder()
                .setCustomId("modalConsultas")
                .setTitle("🔍 - Buscar usários da blacklist!")

            const IdGame = new TextInputBuilder()
                .setCustomId("consultarIdGame")
                .setMaxLength(60)
                .setLabel("🔍・Qual é o ID no Game?")
                .setMinLength(3)
                .setPlaceholder("Ex: 62875162")
                .setStyle(1)
                .setRequired(true)

            modal.addComponents(new ActionRowBuilder().addComponents(IdGame))

            await interaction.showModal(modal)
        };
        if (customId === "modalConsultas") {
            const pergunta = await interaction.fields.getTextInputValue("consultarIdGame")

            const tibitar = await taxados.get(`${pergunta}`)
            if (!tibitar) {
                return interaction.reply({ content: `**🔔 | O usuário \`${pergunta}\`não está em Blacklist!**`, ephemeral: true })
            }
            const embed = new EmbedBuilder()
                .setTitle(`🔍・Resultado da pesquisa!`)
                .setTimestamp()
                .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                .setColor("Green")
                .setDescription(`- **Nome do indivíduo: ${tibitar.Nome}**\n- **Infos Discord: <@${tibitar.DiscordID}> - \`\`${tibitar.DiscordID}\`\`**\n- **ID em Game: \`\`${tibitar.GameID}\`\`**\n- **Motivo: \`\`${tibitar.Motivo}\`\`**\n- **Provas: ${tibitar.Provas}**\n- **Responsável: <@${tibitar.Responsavel}> - \`\`${tibitar.Responsavel}\`\`**`);
            await interaction.reply({ embeds: [embed], ephemeral: true })
        };
        if (customId === `${interaction.user.id}_AddPerm`) {
            await interaction.update({
                embeds: [],
                components: [
                    new ActionRowBuilder().addComponents(
                        new UserSelectMenuBuilder()
                            .setMaxValues(1)
                            .setPlaceholder("Selecione o usuário!")
                            .setCustomId(`${interaction.user.id}_selectaddUserPerm`)
                    ),
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_VoltarPerms`)
                            .setLabel("Voltar")
                            .setEmoji("1269079845585948724")
                            .setStyle(ButtonStyle.Secondary)
                    )
                ],
                content: ""
            });
        };
        if (customId === `${interaction.user.id}_selectaddUserPerm`) {
            const options = interaction.values[0];
            const search = await perm.get(options);
            if (search) {
                return interaction.update({
                    content: "**🔔 | Usuário ja na lista de permissões!**", embeds: [], components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${interaction.user.id}_VoltarPerms`)
                                .setLabel("Voltar")
                                .setEmoji("1269079845585948724")
                                .setStyle(ButtonStyle.Secondary)
                        )

                    ]
                })
            } else {
                await perm.set(options, options)
                await VoltarPerms(interaction, client)
            }
        };
        if (customId === `${interaction.user.id}_RemovePerm`) {
            await interaction.update({
                components: [
                    new ActionRowBuilder().addComponents(
                        new UserSelectMenuBuilder()
                            .setMaxValues(1)
                            .setCustomId(`${interaction.user.id}_selectaddRemove`)
                            .setPlaceholder("Selecione o usuário!")
                    ),
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_VoltarPerms`)
                            .setLabel("Voltar")
                            .setEmoji("1269079845585948724")
                            .setStyle(ButtonStyle.Secondary)

                    )
                ],
                embeds: [],
                content: ""
            })
        };
        if (customId === `${interaction.user.id}_selectaddRemove`) {
            const options = await interaction.values[0];
            const search = await perm.get(options)
            if (!search) {
                return await interaction.update({
                    embeds: [],
                    content: "**🔔 | Usuário não está na lista de permissões!**",
                    components: [
                        new ActionRowBuilder(
                            new ButtonBuilder()
                                .setCustomId(`${interaction.user.id}_VoltarPerms`)
                                .setLabel("Voltar")
                                .setEmoji("1269079845585948724")
                                .setStyle(ButtonStyle.Secondary)
                        )

                    ]
                })
            }
            await perm.delete(options)
            await VoltarPerms(interaction, client)
        };
        if (customId === `${interaction.user.id}_VoltarPerms`) {
            await VoltarPerms(interaction, client)
        };
        if (customId === "enviarchaveadmin") {
            const orientadorRole = fila.get(`Channels.RoleOrientador`);
            const cara = interaction.guild.members.cache.get(interaction.user.id);
            if (!orientadorRole) {
                return interaction.reply({ content: `**❌ | Aguarde que o dono configure tudo corretamente!**`, ephemeral: true })
            }
            if (!cara.roles.cache.has(orientadorRole)) {
                return interaction.reply({ content: `**❌ | Você não possui o cargo de orientador...**`, ephemeral: true })
            }
            const modal = new ModalBuilder()
                .setCustomId("enviarchaveadminModal")
                .setTitle("🗝️ - Enviar chave pix!");

            const chave = new TextInputBuilder()
                .setCustomId("chavepixAdmin")
                .setMaxLength(30)
                .setMinLength(5)
                .setLabel("Chave PIX")
                .setPlaceholder("Ex: 999-999-999-99")
                .setStyle(1);

            const tipoChave = new TextInputBuilder()
                .setCustomId("TypechavepixAdmin")
                .setMaxLength(15)
                .setLabel("Modelo PIX")
                .setMinLength(3)
                .setPlaceholder("Ex: CPF")
                .setStyle(1);

            modal.addComponents(new ActionRowBuilder().addComponents(chave));
            modal.addComponents(new ActionRowBuilder().addComponents(tipoChave));

            await interaction.showModal(modal);

        };
        if (customId === "enviarchaveadminModal") {
            const chave = await interaction.fields.getTextInputValue("chavepixAdmin")
            const typeChave = await interaction.fields.getTextInputValue("TypechavepixAdmin")

            await payments.set(interaction.user.id, {
                Chave: chave,
                Type: typeChave
            })
            await interaction.reply({
                embeds:
                    [
                        new EmbedBuilder()
                            .setTitle("Chave PIX configurada com sucesso!")
                            .setColor("Blue")
                            .setDescription(`**🔔 | A chave PIX foi configurada com êxito.**\n- **Informações:**\n> **Chave:** ${chave}\n> **Tipo:** ${typeChave}\n\nLembre-se, isso será teu método de pagamento para os usuários que iniciarem filas e você for o mediador.`)
                    ],
                    ephemeral:true
            })
        };
        if (customId === "verificarchaveadmin") {
            const Chave = await payments.get(`${interaction.user.id}.Chave`)
            const typeChave = await payments.get(`${interaction.user.id}.Type`)
            if (!Chave) {
                return interaction.reply({ content: `**🔍 | Nenhuma chave pix encontrada!**`, ephemeral:true })
            }
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle("Chave PIX encontrada com sucesso!")
                    .setColor("Blue")
                    .setDescription(`**🔔 | A chave PIX foi encontrada na pesquisa.**\n- **Informações:**\n> **Chave:** ${Chave}\n> **Tipo:** ${typeChave}\n\nLembre-se, isso será teu método de pagamento para os usuários que iniciarem filas e você for o mediador.`)
                ], 
                ephemeral:true
            })
        };
    }
}