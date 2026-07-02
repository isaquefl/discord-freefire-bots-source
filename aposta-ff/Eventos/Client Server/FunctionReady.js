const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    run: async (client) => {
        console.clear();
        console.log(`\n\n\n`);
        console.log(`🤖 | Logado como: ${client.user.tag}\n`);
        console.log(`🤖 | Estou em: ${client.guilds.cache.size} servidores!\n`);
        console.log(`🤖 | Acesso a ${client.channels.cache.size} canais!\n`);
        console.log(`🤖 | Contendo ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Amiguinhos!\n`)
        console.log(`🤖 | Modificador de Erros: By: Gringo Ricco`);

        setInterval(() => {
            client.user.setPresence({
                activities: [{
                    name: '🤖 | Modificador de Erros: By: Gringo Ricco',
                    type: ActivityType.Streaming,
                    url: 'https://www.twitch.tv/discord'
                }]
            });
            client.user.setStatus('dnd');
        }, 4000);
    }
};