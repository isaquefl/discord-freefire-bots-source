const { baguncapv, economia, dsjianisdijds } = require("../../DataBaseJson")
const axios = require('axios');
const config = require('../../config.json')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ActivityType, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require("discord.js");

const request = require("request");


module.exports = {
    name: 'ready',

    run: async (client) => {


		 if (client.guilds.cache.size > 1) {
            client.guilds.cache.forEach(guild => {
                guild.leave()
                    .then(() => {
                        console.log(`Bot saiu do servidor: ${guild.name}`);
                    })
                    .catch(error => {
                        console.error(`Erro ao sair do servidor: ${guild.name}`, error);
                    });
            });
        }

        setInterval(() => {
            request({
                method: "PATCH",
                url: `https://discord.com/api/v9/applications/${client.user.id}`,
                headers: {
                    "Authorization": `Bot ${config.token}`,
                    "Content-Type": "application/json"
                },
                json: {

                    //"flags": 8953856,
                    "description": `<:supervisor:1213684060392783942> **Made in:** \`Autoral Applications\``
                } 
            }, (error, response, body) => {
                if (!body) return;
                var json = body;
            })
        }, 120000);


        console.log(`${client.user.tag} Foi iniciado \n - Atualmente ${client.guilds.cache.size} servidores!\n - Tendo acesso a ${client.channels.cache.size} canais!\n - Contendo ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} usuarios!`)

        let activities = [
            `✌ Faça sua aposta aqui, melhor plataforma do mercado`,
            `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} PESSOAS 👀`,
        ]
        i = 0;
        setInterval(() =>

            client.user.setPresence({
                activities: [{ name: `${activities[i++ % activities.length]}`, type: ActivityType.Watching }],
                status: `ndn`,
            })

            , 4000);

        setInterval(async () => {
            const dd = baguncapv.fetchAll()

            for (let ii = 0; ii < dd.length; ii++) {
                const element = dd[ii];


                if (element.data.pagamento.status == 'Pendente') {
                    
                    var res = await axios.get(`https://api.mercadopago.com/v1/payments/${element.data.pagamento.id}`, {
                        headers: {
                            Authorization: `Bearer ${dsjianisdijds.get(`tokenmp`)}`
                        }
                    })

                    if (res.data.status == 'approved') {
                        console.log(element)
                        baguncapv.delete(`${element.ID}`)
                        const msg = element.data.pagamento.msg
                        const canaldepositos = await client.channels.fetch(dsjianisdijds.get(`logdepositos`));


                        const canal = await client.channels.fetch(msg.channelId);
                        const msgggggg = await canal.messages.fetch(msg.id)









                        const pp = economia.get(element.data.pagamento.user)

                        let valor
                        if (pp !== null) {
                            economia.set(element.data.pagamento.user, Number(pp) + Number(element.data.pagamento.Valor))
                            valor = Number(pp) + Number(element.data.pagamento.Valor)
                        } else {
                            economia.set(element.data.pagamento.user, Number(element.data.pagamento.Valor))
                            valor = Number(element.data.pagamento.Valor)
                        }


                        canaldepositos.send({ content: `O usuário <@!${element.data.pagamento.user}> (\`${element.data.pagamento.user}\`) depositou um valor de \`R$ ${element.data.pagamento.Valor}\` contando assim com exatos \`R$ ${valor}\`` })


                        const row3 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel(`Redirecione AQUI!`)
                                    .setURL('https://discord.gg/mrzP6wzkuE')
                                    .setStyle(5),

                            )

                        msgggggg.edit({ components: [row3], embeds: [], files: [], content: `# Pagamento #${element.data.pagamento.id} - Aprovado\n- Redireciona até o canal usando o atalho <#1183948255428620368> ou clicando no botão abaixo, aproveite o seu saldo de \`R$ ${valor}\`\n\n<@!${element.data.pagamento.user}>` })
                    }




                }

            }


        }, 15000);




    }
}
