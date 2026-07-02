const { ApplicationCommandType, EmbedBuilder } = require("discord.js")
const { rankingConfig, ranking } = require("../../database")


module.exports = {
    name: "ranking",
    description: "[🌍 / Owner] Veja o ranking deste servidor em batalhas!",
    type: ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const topRanking = await rankingConfig.get(`RankingPeople`) || 10;
        let msg = "";
        const all = await ranking.all().sort((a, b) => b.data - a.data).slice(0, topRanking);
        if (all.length < 1) {
            return interaction.reply({ content: "**❌ | Sem usuários no ranking!**", ephemeral:true })
        }
        all.forEach((user, index) => {
            msg += `\`${index + 1}\` | <@${user.ID}> - \`${user.ID}\`** - Pontuação:** **${user.data}**\n\n`;
        });

        await interaction.reply({
            content: "",
            embeds:
                [
                    new EmbedBuilder()
                        .setAuthor({ name: `${interaction.guild.name} | Ranking Top ${topRanking}!`, iconURL: "https://media.discordapp.net/attachments/1268732311432855552/1288975691597086812/cs_gold.png?ex=66f723a8&is=66f5d228&hm=555664aedb3112bf10c9bcb935c3b557f5a37d4246c9af40f7620849ee619eb6&=&format=webp&quality=lossless&width=202&height=202" })
                        .setDescription(`**🏆・Top ${topRanking} de vencedores!**\n${msg}`)
                        .setColor("Red")
                ]
        })
    }
}