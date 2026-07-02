const Discord = require("discord.js")

module.exports = {
    name: "ready",
    run: async (client) => {
        setInterval(() => {
			const channel = client.channels.cache.get("1226396366972915742");
			channel.bulkDelete(99).then(() => {
				channel.send({
					content:`<:autoral_bomba:1226399971662630923> Utilize o seguinte comando para começa a sua aposta: /mines`,
				})
			})
		},60000)
    }
};
