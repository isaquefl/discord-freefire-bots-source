const fs = require("fs")

module.exports = {

  run: (client) => {

    //====Handler das Slahs====\\
    const SlashsArray = []

    fs.readdir(`././ComandosSlash/`, (erro, pasta) => {
      pasta.forEach(subpasta => {
        fs.readdir(`././ComandosSlash/${subpasta}/`, (erro, arquivos) => {
          arquivos.forEach(arquivo => {
            if (!arquivo?.endsWith('.js')) return;
            arquivo = require(`../ComandosSlash/${subpasta}/${arquivo}`);
            if (!arquivo?.name) return;
            client.slashCommands.set(arquivo?.name, arquivo);
            SlashsArray.push(arquivo)
          });
        });
      });
    });

    client.on("ready", async () => {
      // const guild = client.guilds.cache.get("1058125479741235280")

      // if (!guild) {
      //   console.log("O servidor específicado para registrar as slashs é inválido.", "Desligando...")
      //   process.exit();
      // }

      // guild.commands.set(SlashsArray);
      client.application.commands.set(SlashsArray);

    })
  }
}
