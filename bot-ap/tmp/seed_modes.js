const { tables } = require("./database/db");

const defaults = [
  { nome: "UMP (X1)", emoji: "🔫" },
  { nome: "Desert Eagle (X1)", emoji: "🔫" },
  { nome: "Sniper (X1)", emoji: "🎯" },
  { nome: "Armas Diversas (X1)", emoji: "⚔️" },
  { nome: "4v4 Apostado", emoji: "👥" },
  { nome: "Ranked FF", emoji: "🏆" }
];

defaults.forEach(d => {
  if (!tables.modos_partida.find(m => m.nome === d.nome)) {
    tables.modos_partida.insert(d);
  }
});

console.log("Seed concluído.");
process.exit(0);
