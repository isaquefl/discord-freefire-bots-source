const { GatewayIntentBits, Client, Collection, ChannelType } = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
    ]
});
const config = require("./config.json");
const events = require('./Handler/events')
const slash = require('./Handler/slash');

slash.run(client)
events.run(client)

client.on('guildCreate', guild => {


    if (client.guilds.cache.size > 1) {
        guild.leave()
    }

})


client.slashCommands = new Collection();

process.on('unhandRejection', (reason, promise) => {
 //   console.log(`🚫 Erro Detectado:\n\n` + reason, promise)
});
process.on('uncaughtException', (error, origin) => {
   // console.log(`🚫 Erro Detectado:\n\n` + error, origin)
});
process.on('uncaughtExceptionMonitor', (error, origin) => {
  //  console.log(`🚫 Erro Detectado:\n\n` + error, origin)
});

client.login(config.token);

