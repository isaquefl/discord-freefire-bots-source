const { Client, GatewayIntentBits, Collection, Partials, EmbedBuilder } = require("discord.js");
console.clear()
const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    partials: Object.keys(Partials)
});
module.exports = client;
client.slashCommands = new Collection();
const { token, owner } = require("./token.json");
client.login(token).catch((err) => {
    if (err?.message?.includes("intent")) return console.log("❔ | Já ativou as intents no discord.developer?")
    if (err?.message?.includes("invalid")) return console.log("❔ | O token está valido?");
    console.log("Vish dog, deu erro aqui!", err);
});

client.owner = owner;
const evento = require("./handler/Events");
evento.run(client);
require("./handler/index")(client);

client.on("guildCreate", async (guild) => {
    try {
        await guild.commands.set(client.slashCommands);
    } catch (error) {
        console.error(`| Erro ao adicionar Slash Commands em ${guild.name}:`, error);
    }
});

process.on('unhandRejection', (reason, promise) => {
console.log(`🚫 Erro Detectado:\n\n` + reason, promise);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(`🚫 Erro Detectado:\n\n`, err, origin)
})

process.on('uncaughtException', (error, origin) => {
console.log(`🚫 Erro Detectado:\n\n` + error, origin);
});
