const Discord = require('discord.js');

module.exports = {
    name: "baltop",
    description: "gives a list of the top 10 richest members of the server",
    arguments: "",
    cooldown: 3,
    execute(message, args, con) {
        con.query(`SELECT * FROM coins WHERE server = '${message.guild.id}' ORDER BY coins DESC`, (err, entries) => {
            if (err) throw err;
            const output = new Discord.MessageEmbed().setColor('#edc35a').setDescription('🤑🤑🤑');
            len = entries.length;
            for (i = 0; i < len; i++) {
                s = ".."
                if (message.client.users.cache.get(entries[i].id)) s = message.client.users.cache.get(entries[i].id).username;
                output.addField(`${i+1}: ${entries[i].coins}`, 
                `↳${s}`);
            }
            return message.channel.send(output);
        })
    }
}