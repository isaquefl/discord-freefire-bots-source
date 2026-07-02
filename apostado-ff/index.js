const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config/config.json');

// Criação do cliente do bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Coleção de comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Carregar todos os comandos
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Evento: Quando o bot estiver pronto
client.once('ready', () => {
  console.log(`Bot online! Logado como ${client.user.tag}`);
});

// Evento: Lidando com interações
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'Houve um erro ao executar este comando!',
      ephemeral: true,
    });
  }
});

// Logar o bot
client.login(token);