const { 
    ApplicationCommandType, 
    ApplicationCommandOptionType, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    PermissionsBitField 
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const { General, Emojis } = require("../../Database");

let filaCount = 0;
const botOwnerId = '1305641893417189379';

module.exports = {
    name: "fila",
    description: "Crie várias filas no canal atual!",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "tipo",
            description: "Escolha o tipo de fila (Tático, Emulador, Mobile, Misto)",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Tático', value: 'tatico' },
                { name: 'Emulador', value: 'emulador' },
                { name: 'Mobile', value: 'mobile' },
                { name: 'Misto', value: 'misto' }
            ]
        },
        {
            name: "modo",
            description: "Escolha o modo da partida (1v1, 2v2, 3v3, 4v4)",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: '1v1', value: '1v1' },
                { name: '2v2', value: '2v2' },
                { name: '3v3', value: '3v3' },
                { name: '4v4', value: '4v4' }
            ]
        }
    ],
    run: async (client, interaction) => {
        console.log("Comando /fila foi acionado!");

        const permsPath = path.join(__dirname, "../../Database/Perms.json");

        let permsData;
        try {
            permsData = JSON.parse(fs.readFileSync(permsPath, "utf8"));
        } catch (error) {
            console.error("Erro ao ler o arquivo Perms.json:", error);
            return interaction.reply({
                content: "Erro ao carregar as permissões.",
                ephemeral: true,
            });
        }

        const creatorId = Object.keys(permsData)[0];
        console.log("ID do criador: " + creatorId);

        if (interaction.user.id !== creatorId) {
            const embed = new EmbedBuilder()
                .setDescription(`${Emojis.get('Errado')} | Você não possui permissão para utilizar esse comando.`)
                .setColor(General.get('Cor').Error || '#F59133');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const tipoFila = interaction.options.getString('tipo');
        const modo = interaction.options.getString('modo');

        const embed = new EmbedBuilder()
            .setTitle(`Fila Criada: ${tipoFila}`)
            .setDescription(`**Modo escolhido**: ${modo}\n\nClique nos botões abaixo para entrar na fila!`)
            .setColor(General.get('Cor').Success || '#33F5FF')
            .setTimestamp();

        const filaButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('entrar_fila')
                    .setLabel('Entrar na Fila')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('fechar_fila')
                    .setLabel('Fechar Fila')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [filaButtons] });

        console.log("Embed com botões enviada!");

        console.log("Iniciando o coletor de interações...");

        const filter = (i) => i.customId === 'entrar_fila';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            console.log(`Botão 'Entrar na Fila' clicado por ${i.user.tag}`);

            try {
                await i.channel.send({ content: `${i.user.tag} entrou na fila!` });

                const categoriaId = '1305695203797241858';

                const canalPagamento = await i.guild.channels.create({
                    name: `Pagamento-${i.user.username}`,
                    type: 0,
                    parent: categoriaId,
                    permissionOverwrites: [
                        {
                            id: i.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: i.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        }
                    ],
                });
                
                const pagamentoEmbed = new EmbedBuilder()
                    .setTitle('Pagamento Pendentes')
                    .setDescription(`Olá ${i.user.username}, por favor, efetue o pagamento de 5$ utilizando a chave PIX abaixo e escreva "Paguei" neste canal quando o pagamento for realizado.\n\nChave PIX: \`gringoricco@programmer\`\n\nAguarde nossa confirmação após o pagamento!`)
                    .setColor('#FFD700')
                    .setTimestamp();

                const approveButton = new ButtonBuilder()
                    .setCustomId('aprovar_pagamento')
                    .setLabel('Aprovar Pagamento')
                    .setStyle(ButtonStyle.Success);

                const paymentRow = new ActionRowBuilder().addComponents(approveButton);

                await canalPagamento.send({
                    embeds: [pagamentoEmbed],
                    components: [paymentRow]
                });

                await i.reply({ content: `${i.user.tag} entrou na fila com sucesso! Você foi direcionado ao canal de pagamento.`, ephemeral: true });

            } catch (error) {
                console.error('Erro ao processar interação:', error);
                await i.reply({ content: "Ocorreu um erro ao processar sua interação. Tente novamente mais tarde.", ephemeral: true });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.editReply({ content: "O tempo para entrar na fila acabou.", components: [] });
            }
        });

        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'aprovar_pagamento') {
                if (interaction.user.id !== botOwnerId) {
                    return interaction.reply({ content: 'Somente o dono do bot pode aprovar pagamentos.', ephemeral: true });
                }

                try {
                    await interaction.reply({ content: 'Pagamento aprovado com sucesso!', ephemeral: true });
                    console.log('Pagamento aprovado.');

                    const channel = interaction.channel;
                    await channel.send('Pagamento foi aprovado, agora aguarde um admin ou dono vir ajudar vc! Boa sorte!');

                } catch (error) {
                    console.error('Erro ao aprovar pagamento:', error);
                    await interaction.reply({ content: 'Ocorreu um erro ao tentar aprovar o pagamento.', ephemeral: true });
                }
            }
        });
    }
};
