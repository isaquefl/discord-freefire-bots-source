
const Discord = require("discord.js")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require("discord.js");
const { msgg, economia, baguncapv, saques, dsjianisdijds } = require("../../DataBaseJson");
const mercadopago = require("mercadopago");
const { QRCodeStyling } = require('qr-code-styling-node/lib/qr-code-styling.common');
const canvas = require('canvas');
const config = require("../../config.json");
const qtdbombas = 4
const porcentagembomba = 0.30
const qtdacadadima = 0.2
const onButtonClicked = new Set();
const onButtonClicked2 = new Set();


module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.type == Discord.InteractionType.ModalSubmit) {




            if (interaction.customId === 'wdwadwadwa2') {

                let confirm = interaction.fields.getTextInputValue('tokenMP');


                try {
                    dsjianisdijds.set(`tokenmp`, confirm)
                    interaction.reply({ content: `✅ Sucesso! O token foi setado com sucesso.`, ephemeral: true })
                } catch (error) {
                    console.log(error)
                    interaction.reply({ content: `❌ Ooops.. Houve um Erro!` })
                }


            }

            if (interaction.customId === 'wdwadwadwa22222') {

                let confirm = interaction.fields.getTextInputValue('tokenMP');


                try {
                    dsjianisdijds.set(`logsperdidos`, confirm)
                    interaction.reply({ content: `✅ Sucesso! A log perdidos foi setado com sucesso.`, ephemeral: true })
                } catch (error) {
                    console.log(error)
                    interaction.reply({ content: `❌ Ooops.. Houve um Erro!` })
                }


            }
            if (interaction.customId === 'wdwadwadwa2222') {


                let confirm = interaction.fields.getTextInputValue('tokenMP');


                try {
                    dsjianisdijds.set(`logresgatados`, confirm)
                    interaction.reply({ content: `✅ Sucesso! A log resgatados foi setado com sucesso.`, ephemeral: true })
                } catch (error) {
                    console.log(error)
                    interaction.reply({ content: `❌ Ooops.. Houve um Erro!` })
                }



            }

            if (interaction.customId === 'wdwadwadwa2222222222222222') {


                let confirm = interaction.fields.getTextInputValue('tokenMP');


                try {
                    dsjianisdijds.set(`loginiciou`, confirm)
                    interaction.reply({ content: `✅ Sucesso! A log iniciou game foi setado com sucesso.`, ephemeral: true })
                } catch (error) {
                    console.log(error)
                    interaction.reply({ content: `❌ Ooops.. Houve um Erro!` })
                }



            }

            if (interaction.customId === 'wdwadwadwa22') {


                let confirm = interaction.fields.getTextInputValue('tokenMP');


                try {
                    dsjianisdijds.set(`logsaques`, confirm)
                    interaction.reply({ content: `✅ Sucesso! A log de saques foi setada.`, ephemeral: true })
                } catch (error) {
                    console.log(error)
                    interaction.reply({ content: `❌ Ooops.. Houve um Erro!` })
                }



            }

            if (interaction.customId === 'wdwadwadwa2222222') {


                let confirm = interaction.fields.getTextInputValue('tokenMP');


                try {
                    dsjianisdijds.set(`logdepositos`, confirm)
                    interaction.reply({ content: `✅ Sucesso! A log de depósitos foi setada.`, ephemeral: true })
                } catch (error) {
                    console.log(error)
                    interaction.reply({ content: `❌ Ooops.. Houve um Erro!` })
                }



            }

            if (interaction.customId === 'wdwadwadwa22222222222') {


                let confirm = interaction.fields.getTextInputValue('tokenMP');


                try {
                    dsjianisdijds.set(`logdepositos`, confirm)
                    interaction.reply({ content: `✅ Sucesso! A log de Game Iniciado foi setada.`, ephemeral: true })
                } catch (error) {
                    console.log(error)
                    interaction.reply({ content: `❌ Ooops.. Houve um Erro!` })
                }



            }



            if (interaction.customId === 'wdwadwadwa222') {


                let confirm = interaction.fields.getTextInputValue('tokenMP');


                try {
                    dsjianisdijds.set(`logsaques`, confirm)
                    interaction.reply({ content: `✅ Sucesso! A log de saques foi setada.`, ephemeral: true })
                } catch (error) {
                    console.log(error)
                    interaction.reply({ content: `❌ Ooops.. Houve um Erro!` })
                }



            }


            if (interaction.customId === 'wdwadwadwa') {
                let confirm = interaction.fields.getTextInputValue('tokenMP');

                await interaction.reply({ content: `🔄 Aguarde....`, ephemeral: true })



                const gg = confirm.replace(',', '.')

                if (isNaN(gg) == true) return interaction.reply({ ephemeral: true, content: `❌ | O valor escolhido esta \`INCORRETO!\`` })

                if (gg > 100) return interaction.editReply({ ephemeral: true, content: `❌ | O valor maximo para deposito e de \`R$ 100,00\`` })
                if (gg < 2.50) return interaction.editReply({ ephemeral: true, content: `❌ | O valor minimo para deposito e de \`R$ 2,50\`` })


                var payment_data = {
                    transaction_amount: Number(gg),
                    description: `Pagamento - ${interaction.user.username}`,
                    payment_method_id: 'pix',
                    payer: {
                        email: `${interaction.user.id}@gmail.com`,
                        first_name: `Victor André`,
                        last_name: `Ricardo Almeida`,
                        identification: {
                            type: 'CPF',
                            number: '15084299872'
                        },

                        address: {
                            zip_code: '86063190',
                            street_name: 'Rua Jácomo Piccinin',
                            street_number: '971',
                            neighborhood: 'Pinheiros',
                            city: 'Londrina',
                            federal_unit: 'PR'
                        }
                    }
                }
                mercadopago.configurations.setAccessToken(dsjianisdijds.get(`tokenmp`));
                await mercadopago.payment.create(payment_data)
                    .then(async function (data) {

                        const ttttt = data.body.point_of_interaction.transaction_data.qr_code_base64;


                        const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
                        const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });


                        const embed = new EmbedBuilder()
                            .setColor(`2b2d31`)
                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })

                            .setTitle(`Pagamento via PIX criado`)
                            .addFields(
                                { name: `Código copia e cola`, value: `\`\`\`${data.body.point_of_interaction.transaction_data.qr_code}\`\`\`` }
                            )
                            .setTimestamp()
                            .setImage(`https://cdn.discordapp.com/attachments/1179498681481830542/1179499043777429615/qr_code.png?ex=657a0116&is=65678c16&hm=83a7242c9f6a72f9128da76b14ede8ee1df01f5ba0ed0799f8c753b92fa8ede0&`)



                        const row3 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId("codigocopiaecola")
                                    .setLabel('Código copia e cola')
                                    .setStyle(2),

                            )



                        embed.setImage('attachment://payment.png')


                        try {


                            await interaction.user.send({ embeds: [embed], files: [attachment], components: [row3] }).then(msggg => {

                                baguncapv.set(`${msggg.id}.pagamento.msg`, msggg)
                                baguncapv.set(`${msggg.id}.pagamento.status`, `Pendente`)
                                baguncapv.set(`${msggg.id}.pagamento.Valor`, gg)
                                baguncapv.set(`${msggg.id}.pagamento.cp`, data.body.point_of_interaction.transaction_data.qr_code)
                                baguncapv.set(`${msggg.id}.pagamento.id`, data.body.id)
                                baguncapv.set(`${msggg.id}.pagamento.user`, interaction.user.id)



                                const row3 = new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel(`Redirecione AQUI!`)
                                            .setURL(msggg.url)
                                            .setStyle(5),

                                    )

                                interaction.editReply({ ephemeral: true, content: `✅ | Pagamento gerado! Verifique seu privado para realizar o Pagamento!`, components: [row3] })



                            })
                        } catch (error) {
                            interaction.editReply({ ephemeral: true, content: `❌ | Seu privado está fechado com isso não consigo gerar pagamento!` })
                        }




                    })



            }





            if (interaction.customId === 'wdwadwaawdwadwadwa') {
                let valor = interaction.fields.getTextInputValue('tokenMP');
                let chavepix = interaction.fields.getTextInputValue('tokenMP2');

                const gg = valor.replace(',', '.')

                if (isNaN(gg) == true) return interaction.reply({ ephemeral: true, content: `❌ | O valor escolhido esta \`INCORRETO!\`` })

                const eco = economia.get(interaction.user.id)

                if (Number(eco) == null) return interaction.reply({ ephemeral: true, content: `❌ | Você não possui saldo suficiente para sacar \`R$ ${Number(valor).toFixed(2)}\`` })

                if (Number(eco) < gg) return interaction.reply({ ephemeral: true, content: `❌ | Você não possui saldo suficiente para sacar \`R$ ${Number(valor).toFixed(2)}\`` })

                if (gg > 100) return interaction.reply({ ephemeral: true, content: `❌ | O valor maximo para saque e de \`R$ 100,00\`` })
                if (gg < 5.00) return interaction.reply({ ephemeral: true, content: `❌ | O valor minimo para saque e de \`R$ 5,00\`` })



                economia.set(interaction.user.id, Number(eco) - Number(gg))


                interaction.reply({ ephemeral: true, content: `✅ | Seu pedido de saque de \`${Number(gg).toFixed(2)}\` foi solicitado com sucesso e será avaliado pela equipe nas proximas \`24 Horas\` ` })


                const canalsaques = await client.channels.fetch(dsjianisdijds.get(`logsaques`));


                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("pagamentoenviado")
                            .setLabel('Pagamento Enviado')
                            .setStyle(1),

                    )

                canalsaques.send({ components: [row3], content: `# Solicitação de Saque\n- Usuario: ${interaction.user} (\`${interaction.user.id}\`)\n- Chave Pix: \`${chavepix}\`\n- Valor: \`R$ ${Number(gg).toFixed(2)}\`` }).then(asasaa => {
                    saques.set(asasaa.id, { valor: valor, chavepix: chavepix, status: 'pendente', user: interaction.user.id })
                })

            }

        }

        if (interaction.isButton()) {

            if (interaction.customId == 'pagamentoenviado') {

                const gg = saques.get(interaction.message.id)

                saques.set(`${interaction.message.id}.status`, 'Aprovado')

                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("pagamentoenviado")
                            .setLabel('Pagamento Enviado')
                            .setDisabled(true)
                            .setStyle(1),

                    )

                interaction.message.edit({ components: [row3] })


                interaction.reply({ ephemeral: true, content: `✅ | Você enviou o pagamento do usuario <@!${gg.user}> no valor de \`R$ ${Number(gg.valor).toFixed(2)}\`` })
            }

            if (interaction.customId == `codigocopiaecola`) {
                interaction.reply({ ephemeral: true, content: `${baguncapv.get(`${interaction.message.id}.pagamento.cp`)}` })
            }


            if (interaction.customId == 'sacarmoney') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('wdwadwaawdwadwadwa')
                    .setTitle(`💰 Sacar via PIX`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Valor do saque?`)
                    .setPlaceholder(`Minimo: 5,00 | Maximo: 100,00`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`Chave Pix?`)
                    .setPlaceholder(`22997662123`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN2);



                modalaAA.addComponents(firstActionRow5, firstActionRow6);
                await interaction.showModal(modalaAA);
            }


            if (interaction.customId == 'depositarmoney') {


                const modalaAA = new ModalBuilder()
                    .setCustomId('wdwadwadwa')
                    .setTitle(`💰 Deposito via PIX`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Valor do deposito?`)
                    .setPlaceholder(`Minimo: 2,50 | Maximo: 100,00`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);



                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);

            }

            if (interaction.customId == 'logssaques') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('wdwadwadwa22')
                    .setTitle(`Configurar Logs Saques`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Qual vai ser o ID?`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);

                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);

            }

            if (interaction.customId == 'logsresgatados') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('wdwadwadwa2222')
                    .setTitle(`Configurar Logs Resgatados`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Qual vai ser o ID?`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);

                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);

            }


            if (interaction.customId == 'logdeposito') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('wdwadwadwa2222222')
                    .setTitle(`Configurar Logs Depósitos`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Qual vai ser o ID?`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);

                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);


            }

            if (interaction.customId == 'logsiniciougame') {
                const modalaAA = new ModalBuilder()
                    .setCustomId('wdwadwadwa2222222222222222')
                    .setTitle(`Configurar Logs Iniciou Game`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Qual vai ser o ID?`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);

                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);
            }
            if (interaction.customId == 'logsperdidos') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('wdwadwadwa22222')
                    .setTitle(`Configurar Logs Perdidos`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Qual vai ser o ID?`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);

                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);

            }

            if (interaction.customId == 'tokenmp') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('wdwadwadwa2')
                    .setTitle(`Configurar Token MP`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Qual seu TOKEN MP?`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);

                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);

            }
            if (interaction.customId == 'perfil') {
                const gg = economia.get(interaction.user.id)

                let valor

                if (gg == null) {
                    valor = 0
                } else {
                    valor = gg
                }

                await interaction.reply({ content: `🔄 Aguarde...`, ephemeral: true })
                interaction.editReply({ content: `# 💰 Informações ${interaction.user.username}\n🔧  **Usuário:** ${interaction.user}\n💸 **Seu saldo:** \`R$ ${Number(valor).toFixed(2)}\``, ephemeral: true /*embeds: [embed]*/ })
        //        interaction.reply({ ephemeral: true, content: `⛏️ | Sistema de perfil em manutenção!` })

            }

            if (interaction.customId.includes('mina_')) {
                interaction.deferUpdate()
                let awdwadawdaw = msgg.get(`${interaction.message.id}.userid`);
                if (awdwadawdaw !== interaction.user.id) return

                if (onButtonClicked.has(interaction.user.id)) {
                    return;
                }
                onButtonClicked.add(interaction.user.id);
                setTimeout(() => {
                    onButtonClicked.delete(interaction.user.id);
                }, 3000);

                const id = interaction.customId;
                const yy = parseInt(id.split('mina_')[1]);


                const randomChance = Math.random();

                const buttons = [];
                const totalButtons = 25;
                let customIdCounter = 1;






                for (let i = 0; i < totalButtons; i++) {
                    const button = new ButtonBuilder()
                        .setCustomId(`mina_${customIdCounter}`)
                        .setStyle(2)
                        .setDisabled(false)
                        .setLabel('ㅤㅤ');

                    if (i % 5 === 0) {
                        const row = new ActionRowBuilder().addComponents(button);
                        buttons.push(row);
                    } else {
                        buttons[buttons.length - 1].addComponents(button);
                    }

                    customIdCounter++;
                }


                let buttonsToDisable = msgg.get(`${interaction.message.id}.selecionados`);
                if (buttonsToDisable != null) {
                    if (buttonsToDisable.length == 25 - qtdbombas) {
                        const bombLocations = [];

                        const wdawdwadawaawdawdawdw = msgg.get(`${interaction.message.id}.mensagem.channel`)
                        const wdawdwadawaawdawdawdw2 = msgg.get(`${interaction.message.id}.mensagem.id`)

                        const canal = await client.channels.fetch(wdawdwadawaawdawdawdw);
                        const msgggggg = await canal.messages.fetch(wdawdwadawaawdawdawdw2)
                        msgggggg.delete()


                        msgg.push(`${interaction.message.id}.selecionados`, yy)
                        let buttonsToDisable2 = msgg.get(`${interaction.message.id}.selecionados`);

                        for (let i = 1; i <= 24; i++) {
                            if (!buttonsToDisable2.includes(i)) {
                                bombLocations.push({ position: i });
                            }
                        }

                        bombLocations.forEach((location) => {
                            const rowIdx = Math.floor((location.position - 1) / 5);
                            const colIdx = (location.position - 1) % 5;

                            buttons[rowIdx].components[colIdx]
                                .setDisabled(true)
                                .setLabel('💣')
                                .setStyle(2);
                        });

                        buttonsToDisable2.forEach((buttonNum) => {
                            const rowIdx = Math.floor((buttonNum - 1) / 5);
                            const colIdx = (buttonNum - 1) % 5;

                            buttons[rowIdx].components[colIdx]
                                .setDisabled(true)
                                .setLabel('💎')
                                .setStyle(2);
                        });






                        const gg = economia.get(interaction.user.id)
                        const wdawdwadawad2awdaw2w = msgg.get(`${interaction.message.id}`)

                        msgg.delete(interaction.message.id);
                        const final = wdawdwadawad2awdaw2w.valor * wdawdwadawad2awdaw2w.resgatar

                        const embed = new EmbedBuilder()
                            .setColor(`Green`)
                            .setTitle(`📦 Mines ${interaction.guild.name}`)
                            .setDescription(`# RESGATADO\nVocê resgatou o valor de: \`R$ ${Number(final).toFixed(2)}\`, caso queira jogar novamente de /mines (VALOR)`)

                        const canalresgatou = await client.channels.fetch(dsjianisdijds.get(`logresgatados`));
                        const ffff = economia.get(interaction.user.id)

                        canalresgatou.send({ content: `⛏️ | O usuário ${interaction.user} resgatou um total de \`R$ ${Number(final).toFixed(2)}\` ficando com um valor total de saldo de: \`R$ ${Number(ffff).toFixed(2)}\`` })



                        interaction.message.edit({ components: buttons, embeds: [embed] }).then(aaaa => {
                            setInterval(async () => {
                                try {
                                    await interaction.channel.delete()
                                } catch (error) {
                                }
                            }, 10000);
                        })

                        economia.set(interaction.user.id, Number(gg + final))
                        return;
                    }
                }


                if (randomChance < porcentagembomba) {


                    const wdawdwadawaawdawdawdw = msgg.get(`${interaction.message.id}.mensagem.channel`)
                    const wdawdwadawaawdawdawdw2 = msgg.get(`${interaction.message.id}.mensagem.id`)

                    const canal = await client.channels.fetch(wdawdwadawaawdawdawdw);
                    const msgggggg = await canal.messages.fetch(wdawdwadawaawdawdawdw2)
                    msgggggg.delete()


                    const yy = interaction.customId.replace('mina_', '');

                    const rowIdx = Math.floor((yy - 1) / 5);
                    const colIdx = (yy - 1) % 5;

                    let buttonsToDisableaaa = msgg.get(`${interaction.message.id}.selecionados`);

                    if (buttonsToDisableaaa == null) buttonsToDisableaaa = [];

                    const excludedPositions = buttonsToDisableaaa

                    const bombLocations = [];

                    bombLocations.push({ row: rowIdx, col: colIdx });

                    for (let i = 0; i < qtdbombas - 1; i++) {
                        let randomRow, randomCol;
                        do {
                            randomRow = Math.floor(Math.random() * 5);
                            randomCol = Math.floor(Math.random() * 5);
                        } while (
                            bombLocations.some(
                                (location) => location.row === randomRow && location.col === randomCol
                            ) ||
                            buttonsToDisableaaa.some(
                                (location) => location.row === randomRow && location.col === randomCol
                            ) ||
                            buttonsToDisable.some(
                                (location) => location.row === randomRow && location.col === randomCol
                            ) ||
                            excludedPositions.includes(randomRow * 5 + randomCol + 1)
                        );
                        bombLocations.push({ row: randomRow, col: randomCol });
                    }

                    bombLocations.forEach((location) => {
                        buttons[location.row].components[location.col]
                            .setDisabled(true)
                            .setLabel('💣')
                            .setStyle(2);
                    });

                    for (let i = 0; i < 5; i++) {
                        for (let j = 0; j < 5; j++) {
                            const isBombOrDisabled = bombLocations.some(
                                (location) => location.row === i && location.col === j
                            ) || buttonsToDisable.some(
                                (location) => location.row === i && location.col === j
                            ) || buttonsToDisableaaa.some(
                                (location) => location.row === i && location.col === j
                            );

                            if (!isBombOrDisabled) {
                                buttons[i].components[j]
                                    .setDisabled(true)
                                    .setLabel('💎')
                                    .setStyle(2);
                            }
                        }
                    }

                    msgg.delete(interaction.message.id);


                    const canalperdeu = await client.channels.fetch(dsjianisdijds.get(`logsperdidos`));

                    canalperdeu.send({ content: `❌ | O usuario ${interaction.user} acabou perdendo sua aposta após clicar em \`${buttonsToDisable.length}\` diamantes` })


                    const embed = new EmbedBuilder()
                        .setColor(`Red`)
                        .setTitle(`❌ Mines | Derrota`)
                        .setDescription(`Você escolheu exatamente aonde tinha uma \`BOMBA\` portanto perdeu toda sua recompensa\n\n- Você clicou em ${buttonsToDisable.length} diamantes até perder 😥!`)


                    interaction.message.edit({ components: buttons, embeds: [embed] }).then(aaaa => {
                        setInterval(async () => {
                            try {
                                await interaction.channel.delete()
                            } catch (error) {
                            }
                        }, 10000);
                    })

                } else {


                    const buttonNumber = parseInt(id.split('mina_')[1]);

                    const dfdfdfd = msgg.get(`${interaction.message.id}.selecionados`)

                    if (dfdfdfd.includes(buttonNumber) == true) return
                    await interaction.message.edit({ components: [] })

                    msgg.push(`${interaction.message.id}.selecionados`, buttonNumber)


                    const buttonsToDisable = msgg.get(`${interaction.message.id}.selecionados`)
                    const wdawdwadawad22w = msgg.get(`${interaction.message.id}.resgatar`)
                    msgg.set(`${interaction.message.id}.resgatar`, wdawdwadawad22w + qtdacadadima)
                    const wdawdwadawadw = msgg.get(`${interaction.message.id}.resgatar`)

                    const wdawdwadaawdawdawdawwadw = msgg.get(`${interaction.message.id}.valor`)


                    buttonsToDisable.forEach((buttonNum) => {
                        const rowIdx = Math.floor((buttonNum - 1) / 5);
                        const colIdx = (buttonNum - 1) % 5;

                        buttons[rowIdx].components[colIdx]
                            .setDisabled(true)
                            .setLabel('💎')
                            .setStyle(2);
                    });

                    let qtddima = 25 - qtdbombas

                    if (buttonsToDisable !== 0) {
                        qtddima = qtddima - buttonsToDisable.length
                    }


                    const embed = new EmbedBuilder()
                        .setColor(`Green`)
                        .setTitle(`📦 Mines ${interaction.guild.name}`)
                        .setDescription(`- 💣 Bombas: \`${qtdbombas}\`\n- 💎 Diamantes: \`${qtddima}\`\n- 💸 Proximo Multiplicador: \`${Number(wdawdwadawadw + qtdacadadima).toFixed(2)}x\``)


                    await interaction.message.edit({ components: buttons, embeds: [embed] }).then(async msg22 => {


                        const wdawdwadawaawdawdawdw = msgg.get(`${interaction.message.id}.mensagem.channel`)
                        const wdawdwadawaawdawdawdw2 = msgg.get(`${interaction.message.id}.mensagem.id`)

                        const canal = await client.channels.fetch(wdawdwadawaawdawdawdw);
                        const msgggggg = await canal.messages.fetch(wdawdwadawaawdawdawdw2)


                        const cu = wdawdwadawad22w + qtdacadadima

                        const button = new ButtonBuilder()
                            .setCustomId(`mina_awdawdwadwa`)
                            .setStyle(2)
                            .setDisabled(true)
                            .setLabel('ㅤㅤ');
                        const button2 = new ButtonBuilder()
                            .setCustomId(`mina_awdawdwadawa`)
                            .setStyle(2)
                            .setDisabled(true)
                            .setLabel('ㅤㅤ');

                        const novoBotao = new ButtonBuilder()
                            .setCustomId(`resgatar_${interaction.message.id}`)
                            .setStyle(3)
                            .setDisabled(false)
                            .setLabel(`Resgatar: R$ ${Number(wdawdwadaawdawdawdawwadw * cu).toFixed(2)}`)
                        const novoBotaoRow = new ActionRowBuilder().addComponents(button, novoBotao, button2);

                        await msgggggg.edit({ components: [novoBotaoRow] })

                    })
                }
            }



            if (interaction.customId.includes('resgatar_')) {
                interaction.deferUpdate()
                const yy = interaction.customId
                const dd = yy.replace('resgatar_', '')
                let awdawd222 = msgg.get(`${dd}.userid`);

                if (awdawd222 !== interaction.user.id) return
                if (onButtonClicked2.has(interaction.user.id)) {
                    return;
                }
                onButtonClicked2.add(interaction.user.id);
                setTimeout(() => {
                    onButtonClicked2.delete(interaction.user.id);
                }, 5000);
                await interaction.message.delete()

                const msgggggg = await interaction.channel.messages.fetch(dd)
                await msgggggg.edit({ components: [] })

                let diamondIndices = msgg.get(`${dd}.selecionados`);


                const buttons = [];
                const totalButtons = 25;
                let customIdCounter = 1;

                const bombIndices = [];
                while (bombIndices.length < qtdbombas) {
                    const randomIndex = Math.floor(Math.random() * totalButtons) + 1;
                    if (!diamondIndices.includes(randomIndex) && !bombIndices.includes(randomIndex)) {
                        bombIndices.push(randomIndex);
                    }
                }

                for (let i = 1; i <= totalButtons; i++) {
                    const button = new ButtonBuilder();

                    if (bombIndices.includes(i)) {

                        button.setCustomId(`bomba_${customIdCounter}`)
                            .setStyle(2)
                            .setDisabled(true)
                            .setLabel('💣');
                    } else {

                        button.setCustomId(`diamante_${customIdCounter}`)
                            .setStyle(2)
                            .setDisabled(true)
                            .setLabel('💎');
                    }

                    if (i % 5 === 1) {
                        const row = new ActionRowBuilder().addComponents(button);
                        buttons.push(row);
                    } else {
                        buttons[buttons.length - 1].addComponents(button);
                    }

                    customIdCounter++;
                }

                const gg = economia.get(interaction.user.id)
                const wdawdwadawad2awdaw2w = msgg.get(`${dd}`)
                const final = wdawdwadawad2awdaw2w.valor * wdawdwadawad2awdaw2w.resgatar

                const embed = new EmbedBuilder()
                    .setColor(`Green`)
                    .setTitle(`📦 Mines ${interaction.guild.name}`)
                    .setDescription(`# RESGATADO\nVocê resgatou o valor de: \`R$ ${Number(final).toFixed(2)}\`, caso queira jogar novamente de /mines (VALOR)`)



                msgggggg.edit({ components: buttons, embeds: [embed] }).then(aaaa => {
                    setInterval(async () => {
                        try {
                            await interaction.channel.delete()
                        } catch (error) {
                        }
                    }, 10000);
                })

                economia.set(interaction.user.id, Number(gg + final).toFixed(2))


                const canalresgatou = await client.channels.fetch(dsjianisdijds.get(`logresgatados`));
                const ffff = economia.get(interaction.user.id)

                canalresgatou.send({ content: `⛏️ | O usuário ${interaction.user} resgatou um total de \`R$ ${Number(final).toFixed(2)}\` ficando com um valor total de saldo de: \`R$ ${Number(ffff).toFixed(2)}\`` })

            }
        }

    }
}