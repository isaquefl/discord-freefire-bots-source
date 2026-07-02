const { tables } = require("./database/db");

const modes = tables.modos_partida.all();
modes.forEach(m => {
  const cleanName = m.nome.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\u200D|\uFE0F|[\u2600-\u27BF]/g, "").trim();
  tables.modos_partida.update(x => x.id === m.id, { nome: cleanName, emoji: null });
});

console.log("Modos limpos.");
process.exit(0);
