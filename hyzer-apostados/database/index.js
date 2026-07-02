const { JsonDatabase } = require("wio.db")

const fila = new JsonDatabase({
  databasePath:"./src/database/filas.json"
})

const admin = new JsonDatabase({
  databasePath:"./src/database/Admin.json"
})
const ranking = new JsonDatabase({
  databasePath:"./src/database/rank.json"
})
const rankingConfig = new JsonDatabase({
  databasePath:"./src/database/RankingConfig.json"
})
const taxados = new JsonDatabase({
  databasePath: "./src/database/Taxados.json"
})
const perm = new JsonDatabase({
  databasePath: "./src/database/perms.json"
})

const payments = new JsonDatabase({
  databasePath: "./src/database/payments.json"
})

module.exports.fila = fila;
module.exports.admin = admin;
module.exports.payments = payments;
module.exports.ranking = ranking;
module.exports.taxados = taxados;
module.exports.perm = perm;
module.exports.rankingConfig = rankingConfig;

