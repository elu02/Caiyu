module.exports = {
    name: "bal",
    description: "tells you how many bitcoins you have",
    arguments: "",
    cooldown: 3,
    execute(message, args, con) {
        con.query(`SELECT * FROM coins WHERE id = '${message.author.id}' AND server = '${message.guild.id}'`, (err, entry) => {
            if (err) throw err;
            return message.channel.send(`${message.author} has ${entry[0].coins} bitcoins.`);
        })
    }
}