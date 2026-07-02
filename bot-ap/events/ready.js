const { REST, Routes } = require("discord.js");
const { token, guildID } = require("../config.json");
const { iniciar: iniciarScheduler } = require("../utils/scheduler");
const os = require("os");

module.exports = {
  nome: "clientReady",
  once: true,

  async executar(client) {
    const targetGuild = client.guilds.cache.get(guildID);
    
    

    if (!targetGuild) {
    }

    iniciarScheduler(client);

    const rest = new REST({ version: "10" }).setToken(token);
    const commands = Array.from(client.slashCommands.values()).map(c => c.data.toJSON());

    try {
      // Clear ALL global commands
      await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
      
      // Clear ALL guild commands for the specific guild
      await rest.put(Routes.applicationGuildCommands(client.user.id, guildID), { body: [] });
      
      // Re-register ALL currently loaded slash commands to the guild
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guildID),
        { body: commands }
      );
      console.log("Comandos slash registrados/limpos sucesso.");
    } catch (error) {
      console.error("Erro ao registrar comandos:", error);
    }
  },
};
