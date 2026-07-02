const { perfil, erro } = require("../../utils/embeds");
const { getJogador }   = require("../../database/db");

module.exports = {
  nome: "p",
  aliases: ["perfil", "profile", "stats"],

  async executar(message, args) {
    try {
      const alvo = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : message.author);
      
      if (!alvo) {
        return message.reply({ embeds: [erro("Usuário não Localizado", "O identificador ou menção informado é inválido.")] });
      }

      let member = message.guild.members.cache.get(alvo.id);
      if (!member) {
        member = await message.guild.members.fetch(alvo.id).catch(() => null);
      }

      if (!member) {
        return message.reply({ embeds: [erro("Membro não Encontrado", "O usuário não está presente neste servidor.")] });
      }

      const jogador = getJogador(alvo.id);
      return message.reply({ embeds: [perfil(jogador, member)] });
    } catch (err) {
      console.error("[Error] Falha no comando !p:", err);
      return message.reply({ content: "Erro Crítico: Falha na recuperação de dados do perfil." });
    }
  },
};
