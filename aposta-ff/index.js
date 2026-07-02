const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
console.clear();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ]
});

module.exports = client;
client.slashCommands = new Collection();
const { token } = require("./token.json");
client.login(token);

const evento = require("./Handler/Events");
evento.run(client);
require("./Handler/index")(client);

process.on('unhandledRejection', (reason, promise) => {
  console.log(`🌐 | Erro Detectado:\n\n`, reason, promise);
});

process.on('uncaughtException', (error, origin) => {
  console.log(`🌐 | Erro Detectado:\n\n`, error, origin);
});