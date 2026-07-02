const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ChannelType } = require("discord.js");
const { economia, msgg, dsjianisdijds } = require("../../DataBaseJson");
const config = require('../../config.json')
const Discord = require("discord.js");

module.exports = {
  name: "mines",
  description: "Use para iniciar uma aposta",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'valor',
      description: 'Qual a quantidade de diamantes?',
      type: Discord.ApplicationCommandOptionType.Number,
      required: true
    }
  ],


  run: async (client, interaction, message) => {

    const qtd = interaction.options.getNumber('valor')

    let valor
    const gg = economia.get(interaction.user.id)

    if (gg == null) {
      valor = 0
    } else {
      valor = gg
    }



    if (valor < qtd) return interaction.reply({ ephemeral: true, content: `❌ | Você não possui valor necessario para inciar uma apostá seu saldo é de: \`R$ ${Number(valor).toFixed(2)}\`` })
    if (qtd < 1) return interaction.reply({ ephemeral: true, content: `❌ | Você não possui valor necessario minimo de \`R$ 1,00\` para inciar uma aposta!` })

    const canalcomecou = await client.channels.fetch(dsjianisdijds.get(`loginiciou`));

    canalcomecou.send({ content: `⛏️ | O usuário ${interaction.user} começou um jogo com aposta de \`R$ ${Number(qtd).toFixed(2)}\` ficando com um total de \`R$ ${Number(gg - qtd).toFixed(2)}\` em sua conta!` })


    await interaction.reply({ content: `🔄 Aguarde...`, ephemeral: true }).then(async msg => {
      const thread2222 = interaction.channel.threads.cache.find(x => x.name === `🛒・${interaction.user.username}・${interaction.user.id}`);

      if (thread2222 !== undefined) {
        const row4 = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setURL(`https://discord.com/channels/${interaction.guild.id}/${thread2222.id}`)
              .setLabel('Ir para o carrinho')
              .setStyle(5)
          )

        msg.edit({ content: `❌ | Você já possuí uma aposta em andamento!`, components: [row4] })
        return
      }


      const thread = await interaction.channel.threads.create({
        name: `🛒・${interaction.user.username}・${interaction.user.id}`,
        type: ChannelType.PrivateThread,
        reason: 'Needed a separate thread for moderation',
        members: [interaction.user.id],
      });



      const row4 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setURL(`https://discord.com/channels/${interaction.guild.id}/${thread.id}`)
            .setLabel('Ir para o carrinho')
            .setStyle(5)
        )
      msg.edit({ components: [row4], content: `✅ | Sua aposta foi iniciada acesse <#${thread.id}>, ou então clique no button abaixo.` })


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

      const embed = new EmbedBuilder()
        .setColor(`Green`)
        .setTitle(`📦 Mines ${interaction.guild.name}`)
        .setDescription(`- 💣 Bombas: \`4\`\n- 💎 Diamantes: \`21\`\n- 💸 Proximo Multiplicador: \`${1 + 0.20}x\`\n💡Faça alguma jogada para poder retirar!`)


      thread.send({ components: buttons, embeds: [embed], content: `${interaction.user}` }).then(async msg => {

        const messages22 = await thread.messages.fetch({ limit: 1 });
        const lastMessage = messages22.first();

        msgg.set(lastMessage.id, { valor: qtd, userid: interaction.user.id, selecionados: [], resgatar: 1 })


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
          .setCustomId(`resgatar_${lastMessage.id}`)
          .setStyle(3)
          .setDisabled(true)
          .setLabel(`Resgatar: R$ ${Number(qtd).toFixed(2)}`)
        const novoBotaoRow = new ActionRowBuilder().addComponents(button, novoBotao, button2);

        await thread.send({ components: [novoBotaoRow] }).then(async aaa => {
          const messages22 = await thread.messages.fetch({ limit: 1 });
          const lastMessage22 = messages22.first();

          msgg.set(`${lastMessage.id}.mensagem.channel`, thread.id)
          msgg.set(`${lastMessage.id}.mensagem.id`, lastMessage22.id)
          economia.set(interaction.user.id, Number(gg) - Number(qtd))
        })
      })
    })
  }
}
