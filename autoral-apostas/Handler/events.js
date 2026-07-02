const fs = require('fs')

module.exports = {

    run: (client) => {

        fs.readdirSync('./Eventos/').forEach(local => {
            const eventFiles = fs.readdirSync(`./Eventos/${local}`).filter(arquivo => arquivo.endsWith('.js'))
        for (const file of eventFiles) {
            const event = require(`../Eventos/${local}/${file}`);

            if (event.once) {
                client.once(event.name, (...args) => event.run(...args, client));
            } else {
                client.on(event.name, (...args) => event.run(...args, client));
            }
        }
    })
}
}