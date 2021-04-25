function randomGen() {
    return Math.round(Math.random() * 1000);
}

module.exports = {
    name: "mine",
    description: "mines for bitcoins",
    arguments: "",
    cooldown: 30,
    execute(message, args, con) {
        x = Math.round(Math.random() * 100);
        numCoins = 0;
        if (x >= 98) {
            numCoins = 69000 + randomGen();
        } else if (x >= 85) {
            numCoins = 6900 + Math.round(randomGen() / 10);
        } else if (x >= 15) {
            numCoins = 5 * randomGen();
        } else if (x >= 5) {
            numCoins = 420;
        } 
        con.query(`SELECT * FROM coins WHERE id = '${message.author.id}' AND server = '${message.guild.id}'`, (err, entry) => {
            if (err) throw err;
            curAmount = entry[0].coins;
            con.query(`UPDATE coins SET coins = ${curAmount + numCoins} WHERE id = '${message.author.id}' AND server = '${message.guild.id}'`);
        })
        return message.channel.send(`${message.author} found ${numCoins} bitcoins!`);
    }
}