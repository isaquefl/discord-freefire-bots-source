const { fila, admin, ranking, rankingConfig, perm, payments } = require("../database/index")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder, ChannelSelectMenuBuilder, ChannelType, StringSelectMenuBuilder } = require("discord.js")

async function ConfigCategoryk(interaction) {
    const category = await fila.get(`Channels.categoryAbertura`)

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} | Configurar Categoria` })
        .setTimestamp()
        .setDescription(`**🎯 | Selecione abaixo, a nova categoria de novas filas.**`)
        .setFooter({ text: `${interaction.guild.name} | Configuração`, iconURL: interaction.user.displayAvatarURL() })
    if (category) {
        embed.addFields(
            { name: `Categoria atual:`, value: `<#${category}>` }
        )
    }
    await interaction.update({
        content: "",
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_ConfigCategory`)
                    .setEmoji("<:canaldetexto:1275259354521796638>")
                    .setLabel("Definir Categoria")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_VoltarConfigCategory`)
                    .setLabel("Voltar")
                    .setEmoji("<a:8826vegaleftarrow:1269079845585948724>")
                    .setStyle(ButtonStyle.Secondary)
            )

        ]
    })
};
async function painel(interaction) {
    interaction.update({
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

};
async function configOrientador(interaction) {
    const orientador = await fila.get(`Channels.RoleOrientador`)

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} | Configurar Orientador(a)` })
        .setDescription(`**🎯 | Selecione abaixo, o novo cargo de orientador(a)!**`)
        .setTimestamp()
        .setFooter({ text: `${interaction.guild.name} | Configuração`, iconURL: interaction.user.displayAvatarURL() })
    if (orientador) {
        embed.addFields(
            { name: `Cargo de orientador(a) atual::`, value: `<@&${orientador}>` }
        )
    }
    await interaction.update({
        content: "",
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_ConfigRoleManuseioSelect`)
                    .setEmoji("<:engrenagem:1274503349194199131>")
                    .setLabel("Definir Orientador(a)")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_VoltarConfigCategory`)
                    .setLabel("Voltar")
                    .setEmoji("<a:8826vegaleftarrow:1269079845585948724>")
                    .setStyle(ButtonStyle.Secondary)
            )

        ]
    })

};
async function QueueAdmin(interaction, client) {
    let msg = "";
    const all = await admin.all();
    all.map((rs, index) => {
        msg += ` **\`${index + 1}°\` | <@${rs.ID}> - \`${rs.ID}\`**\n`;
    });
    interaction.message.edit({
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
    await interaction.reply({ content: `**🛜 | Ação realizada com sucesso!**`, ephemeral: true })

};
async function UpdatePayments(interaction, client) {
    const user1 = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User1`);
    const user2 = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.User2`);
    const modo = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Modo`);
    const valor = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Valor`);
    const orientador = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Orientador`);
    const SearchOrientadorPay = await payments.get(orientador);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Bom jogo!", iconURL: "https://media.discordapp.net/attachments/1276648507440238642/1282504892526759937/15394-trophy.png?ex=66df9942&is=66de47c2&hm=19fe8acf1a804f611b5a45594d0663bf8bc269a4e10b5fe34fb558742f2a3572&=&format=webp&quality=lossless&width=66&height=70" })
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(`**Formato: \`\`${modo} x ${modo}\`\`**\n**Valor: \`\`R$${valor}\`\`**\n**Jogadores: <@${user1}>, <@${user2}>.**\n**Orientador: <@${orientador}>**\n- **💠・PIX:\`\`\`${SearchOrientadorPay.Chave}\`\`\`**\n- **📝・Tipo \`\`${SearchOrientadorPay.Type}\`\`**`)
        .setColor("Red");

    await interaction.channel.send({
        content: ``,
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("selectOptionsFila")
                    .setPlaceholder("Selecione a ação que deseja realizar.")
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Painel chamada")
                            .setEmoji("<:phone:1287471545647759451>")
                            .setDescription("Clique aqui gerencie calls!")
                            .setValue("painelcall"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Definir vencedor!")
                            .setEmoji("<a:trophy1:1287534959946371082>")
                            .setDescription("Defina os vencedores da partida!")
                            .setValue("definirvencedoresparty"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Finalizar partida")
                            .setDescription("Clique aqui para deletar a partida!")
                            .setValue("finalizarparty")
                            .setEmoji("<a:error:1274922424860676188>")
                    )
            )
        ]
    });
};
async function PainelChamda(interaction, client) {
    const components = new ActionRowBuilder();
    const canalName = interaction.channel.name;
    const verify = interaction.guild.channels.cache.find(a => a.name === `📞・${canalName}`);
    if (!verify) {
        components.addComponents(
            new ButtonBuilder()
                .setCustomId("criarcallButton")
                .setEmoji("1218977376172507227")
                .setLabel("Criar Call")
                .setStyle(ButtonStyle.Success))
        components.addComponents(
            new ButtonBuilder()
                .setCustomId("deletarcallButton")
                .setEmoji("<:chamada:1279565494470311967>")
                .setLabel("Deletar Call")
                .setDisabled(true)
                .setStyle(ButtonStyle.Danger)
        )
    } else {
        components.addComponents(
            new ButtonBuilder()
                .setCustomId("criarcallButton")
                .setEmoji("1218977376172507227")
                .setLabel("Criar Call")
                .setDisabled(true)
                .setStyle(ButtonStyle.Success)
        )
        components.addComponents(
            new ButtonBuilder()
                .setCustomId("deletarcallButton")
                .setEmoji("<:chamada:1279565494470311967>")
                .setLabel("Deletar Call")
                .setStyle(ButtonStyle.Danger)
        )
    }
    const orientador = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Orientador`);
    await interaction.reply({
        content: ``,
        embeds: [
            new EmbedBuilder()
                .setTitle("Gerenciamento de chamadas!")
                .setDescription(`**Olá orientador <@${orientador}>! Seja bem vindo ao painel gerenciador de chamadas.**`)
        ],
        components: [components],
        ephemeral: true
    });
};
async function recaptchaPanelChamada(interaction, client) {
    const components = new ActionRowBuilder();
    const canalName = interaction.channel.name;
    const verify = interaction.guild.channels.cache.find(a => a.name === `📞・${canalName}`);
    if (!verify) {
        components.addComponents(
            new ButtonBuilder()
                .setCustomId("criarcallButton")
                .setEmoji("1218977376172507227")
                .setLabel("Criar Call")
                .setStyle(ButtonStyle.Success))
        components.addComponents(
            new ButtonBuilder()
                .setCustomId("deletarcallButton")
                .setEmoji("<:chamada:1279565494470311967>")
                .setLabel("Deletar Call")
                .setDisabled(true)
                .setStyle(ButtonStyle.Danger)
        )
    } else {
        components.addComponents(
            new ButtonBuilder()
                .setCustomId("criarcallButton")
                .setEmoji("1218977376172507227")
                .setLabel("Criar Call")
                .setDisabled(true)
                .setStyle(ButtonStyle.Success)
        )
        components.addComponents(
            new ButtonBuilder()
                .setCustomId("deletarcallButton")
                .setEmoji("<:chamada:1279565494470311967>")
                .setLabel("Deletar Call")
                .setStyle(ButtonStyle.Danger)
        )
    }
    const orientador = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.Orientador`);
    await interaction.update({
        content: ``,
        embeds: [
            new EmbedBuilder()
                .setTitle("Gerenciamento de chamadas!")
                .setDescription(`**Olá orientador <@${orientador}>! Seja bem vindo ao painel gerenciador de chamadas.**`)
        ],
        components: [components],
        ephemeral: true
    });

};
async function finalParty(interaction, client) {
    const user = await fila.get(`Channels.SaveInfoChannel.${interaction.channel.id}.UserVencedor`);
    const pontuacaoAtualAtualizada = await ranking.get(user);
    await interaction.channel.send({
        content: "",
        embeds: [
            new EmbedBuilder()
                .setAuthor({ name: "Partida finalizada!" })
                .setDescription(`**🔔・Olá a todos, muito obrigado (a) pela participação.**\n - **Tenho a honra de informa-los que o grande vencedor foi o <@${user}>!**\n > **Ele Agora possui \`${pontuacaoAtualAtualizada}\` Pontos!**`)
                .setFooter({ text: `🎉 Parabéns!` })
                .setColor("Red")
                .setTimestamp()
        ]
    })

};
async function ConfigTopRanking(interaction, client) {
    const quanti = await rankingConfig.get(`RankingPeople`);

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} | Configurar Categoria` })
        .setTimestamp()
        .setDescription(`**🎯 | Selecione abaixo, a quantidade de pessoas do ranking!**`)
        .setFooter({ text: `${interaction.guild.name} | Configuração`, iconURL: interaction.user.displayAvatarURL() })
    if (quanti) {
        embed.addFields(
            { name: `Quantidade atual:`, value: `\`\`\`${quanti}\`\`\`` }
        )
    }
    await interaction.update({
        content: "",
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_IrParaModalConfigRank`)
                    .setEmoji("<:server:1289383179286741012>")
                    .setLabel("Definir Quantidade")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_VoltarConfigCategory`)
                    .setLabel("Voltar")
                    .setEmoji("<a:8826vegaleftarrow:1269079845585948724>")
                    .setStyle(ButtonStyle.Secondary)

            )
        ]
    })
};
async function ConfigChannelBlackList(interaction, client) {
    const channel = await fila.get(`Channels.ChannelBlackList`)
    const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name} | Configurar BlackList!` })
        .setTimestamp()
        .setDescription(`**🎯 | Utilize do botão abaixo para definir o canal de blacklists!**`)
        .setFooter({ text: `${interaction.guild.name} | BlackList`, iconURL: interaction.user.displayAvatarURL() })
    if (!channel) {
        embed.addFields(
            {
                name: "Logs BlackList:", value: `\`\`Canal não configurado.\`\``
            }
        )
    }
    if (channel) {
        embed.addFields(
            {
                name: "Logs BlackList:", value: `<#${channel}>`
            }
        )
    }
    await interaction.update({
        embeds: [
            embed
        ],
        content: "",
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_ChannelBlackListButton2`)
                    .setEmoji("<:canaldetexto:1275259354521796638>")
                    .setLabel("Definir Canal")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_VoltarConfigCategory`)
                    .setLabel("Voltar")
                    .setEmoji("<a:8826vegaleftarrow:1269079845585948724>")
                    .setStyle(ButtonStyle.Secondary)
            )
        ]
    })

};
async function VoltarPerms(interaction, client) {

    let msg = "";

    const all = await perm.all()
    all.map((rs, index) => {
        msg += `\`\`${index + 1}\`\` <@${rs.ID}> - \`\`${rs.ID}\`\`\n`
    })

    const embed = new EmbedBuilder()
        .setTimestamp()
        .setDescription(`- **🎯 | Abaixo, estas visualizando todos os membros presentes em minhas permissões**.\n\n${msg}\n\n> **Para adicionar ou remover algum membro a lista, utilize os botões abaixo!**\n> **Lembre-se, adicione somente pessoas de confiança pois elas podem destruir seu servidor sobre minha posse.**`)

    await interaction.update({
        content: "",
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_AddPerm`)
                    .setLabel("Adicionar")
                    .setEmoji("1277069263160606782")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_RemovePerm`)
                    .setLabel("Remover")
                    .setEmoji("1277069236774240276")
                    .setStyle(ButtonStyle.Danger)
            )
        ]
    })
}

module.exports = {
    ConfigCategoryk,
    QueueAdmin,
    painel,
    configOrientador,
    UpdatePayments,
    PainelChamda,
    recaptchaPanelChamada,
    finalParty,
    ConfigTopRanking,
    ConfigChannelBlackList,
    VoltarPerms
}