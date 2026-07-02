const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  const SlashsArray = [];

  const commandsFolder = path.join(__dirname, "../Comandos");

  fs.readdir(commandsFolder, (error, folders) => {
    if (error) {
      console.error("🌐 | Erro ao ler diretório de comandos:", error);
      return;
    }

    folders.forEach((subfolder) => {
      const subfolderPath = path.join(commandsFolder, subfolder);

      fs.readdir(subfolderPath, (error, files) => {
        if (error) {
          console.error(`🌐 | Erro ao ler subpasta ${subfolder}:`, error);
          return;
        }

        files.forEach((file) => {
          if (!file.endsWith(".js")) return;

          const filePath = path.join(subfolderPath, file);
          const command = require(filePath);

          if (!command.name) return;

          client.slashCommands.set(command.name, command);
          SlashsArray.push(command);
        });
      });
    });
  });

  client.on("ready", async () => {
    client.guilds.cache.forEach((guild) => guild.commands.set(SlashsArray));
  });

  client.on("guildCreate", async (guild) => {
    guild.commands.set(SlashsArray);
  });
};
