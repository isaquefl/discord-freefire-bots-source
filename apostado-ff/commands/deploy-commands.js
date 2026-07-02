const { REST, Routes } = require('discord.js');
const { token } = require('./config/config.json');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Carregar comandos
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

// Registrar os comandos
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Iniciando registro de comandos...');
    await rest.put(
      Routes.applicationCommands('1328071253478735973'),
      { body: commands }
    );
    console.log('Comandos registrados com sucesso!');
  } catch (error) {
    console.error(error);
  }
})();