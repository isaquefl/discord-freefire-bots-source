const { JsonDatabase } = require("wio.db");

const Perms = new JsonDatabase({
    databasePath: "./Database/Perms.json"
});

const Emojis = new JsonDatabase({
    databasePath: "./Database/Emojis.json"
});

const General = new JsonDatabase({
    databasePath: "./Database/General.json"
});

module.exports = {
    Perms,
    General,
    Emojis
};
