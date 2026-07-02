const { getConfig } = require("../database/db");
const { guildID } = require("../config.json");

module.exports = {
  nome: "messageCreate",
  once: false,

  async executar(message, client) {
    if (message.author.bot || !message.guild) return;

    if (message.guild.id !== guildID) return;

    const cfg = getConfig(message.guild.id);
    const prefix = cfg.prefix || "!";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    if (!commandName) return;

    const command = client.prefixCommands.get(commandName) || 
                    client.prefixCommands.find(c => c.aliases && c.aliases.includes(commandName));

    if (!command) return;

    console.log("[LOG] EXECUÇÃO: " + prefix + commandName + " | USUÁRIO: " + message.author.tag);

    try {
      await command.executar(message, args, client);
    } catch (error) {
      console.error("[ERR] FALHA CRÍTICA NO COMANDO " + prefix + commandName + ":", error);
      message.reply({ content: "ERRO CRÍTICO: FALHA NA EXECUÇÃO DO PROTOCOLO." }).catch(() => {});
    }
  },
};
