const {
  JsonDatabase,
} = require("wio.db");

const economia = new JsonDatabase({
  databasePath: "./DataBaseJson/economia.json"
});

const msgg = new JsonDatabase({
  databasePath: "./DataBaseJson/msgg.json"
});

const baguncapv = new JsonDatabase({
  databasePath: "./DataBaseJson/baguncapv.json"
});

const saques = new JsonDatabase({
  databasePath: "./DataBaseJson/saques.json"
});

const dsjianisdijds = new JsonDatabase({
  databasePath: "./DataBaseJson/config.json"
});








module.exports = {
  economia,
  msgg,
  baguncapv,
  saques,
  dsjianisdijds
}