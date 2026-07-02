const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { token, guildID, ownerID } = require("./config.json");



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.slashCommands = new Collection();
client.prefixCommands = new Collection();

function carregarComandos(dir, collection, type) {
  const fullPath = path.join(__dirname, "commands", dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith(".js"));
  for (const file of files) {
    try {
      const cmd = require(path.join(fullPath, file));
      if (type === "slash" && cmd.data && cmd.execute) {
        collection.set(cmd.data.name, cmd);
      } else if (type === "prefix" && cmd.nome && cmd.executar) {
        collection.set(cmd.nome, cmd);
      }
    } catch (e) {
    }
  }
}

carregarComandos("slash", client.slashCommands, "slash");
carregarComandos("prefix", client.prefixCommands, "prefix");

const eventPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventPath).filter(f => f.endsWith(".js"));
for (const file of eventFiles) {
  try {
    const evt = require(path.join(eventPath, file));
    if (evt.nome && evt.executar) {
      if (evt.nome === "ready") evt.nome = "clientReady";
      const exec = (...args) => evt.executar(...args, client);
      if (evt.once) client.once(evt.nome, exec);
      else client.on(evt.nome, exec);
    }
  } catch (e) {
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Rejeição não tratada detectada:", reason.stack || reason);
});

process.on("uncaughtException", (err, origin) => {
  console.error("[FATAL] Erro crítico detectado: " + err + "\nOrigem: " + origin);
});

client.login(token).then(() => {
  console.log("Apostado VIP: Autenticação Realizada.");
  client.user.setActivity("Apostas FF", { type: ActivityType.Competing });
}).catch(err => {
  console.error("[AUTH] Falha fatal na conexão:", err.message);
  process.exit(1);
});
