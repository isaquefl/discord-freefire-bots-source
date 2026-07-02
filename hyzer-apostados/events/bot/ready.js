module.exports = {
    name: "ready",
    run: async (client) => {
        console.clear();
        console.log(`\x1b[36m[INFO]\x1b[32m ${client.user.tag} Foi iniciado - Atualmente ${client.guilds.cache.size} servidores! - Tendo acesso a ${client.channels.cache.size} canais! - Contendo ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} usuários!\x1b[0m`);

        const description = "Apostados com 0% de taxa";
        client.user.setPresence({
            activities: [{ name: description, type: 3 }],
            status: 'online',
        });
    }
};
