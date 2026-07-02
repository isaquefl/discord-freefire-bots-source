const Discord = require("discord.js");
const { MessageEmbed, PermissionFlagsBits, MessageActionRow, MessageCollector, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');


module.exports = {
    name: "trocarqrcode",
    description: "[🛠|💎 Vendas PREMIUM] Trocar QRCode",
    type: Discord.ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: 'novafoto',
            description: 'Qual foto ficará no seu QRCode?',
            type: Discord.ApplicationCommandOptionType.Attachment,
            required: true
        },
    ],

    run: async (client, interaction, message) => {

        let config = {
            method: 'GET',
            headers: {
                'token': 'ac3add76c5a3c9fd6952a#'
            }
        };
        
        await interaction.reply({ content: `Aguarde...`, ephemeral: true })

        const arq = interaction.options.getAttachment('novafoto');
        const dddddd = await fetch(`http://simplesolutions.squareweb.app/api/v1/adicionais/${client.user.id}`, config)
        const info2 = await dddddd.json()
        if (info2?.adicionais?.QRCodePersonalizavel !== true) {
            interaction.editReply({ content: `⚠️ | Para utilizar esse comando você deve adquirir-lo em: [Simple Solutions](https://discord.gg/simplesolutions)`, ephemeral: true })
            return
        }
        const minhaString = arq.name

        if (minhaString.includes(".png")) {
            try {
                const axios = require('axios');
                const path = require('path');
                const fs = require('fs').promises;
                const nomeDoDiretorio = 'Lib';
                const caminhoDoDiretorio = path.resolve(__dirname, '..', '..', nomeDoDiretorio);

                const response = await axios.get(arq.attachment, { responseType: 'arraybuffer' });

                const caminhoNoComputador = path.join(caminhoDoDiretorio, 'aaaaa.png');
                await fs.writeFile(caminhoNoComputador, Buffer.from(response.data));

                interaction.editReply({ content: `✅ | QRCode trocado com sucesso!`, ephemeral: true })
            } catch (error) {
                interaction.editReply({ content: `❌ | Erro ao trocar o QRCode.`, ephemeral: true })
            }




        } else {
            interaction.editReply({ content: `❌ | O arquivo precisa ser .png`, ephemeral: true })
        }


    }
}