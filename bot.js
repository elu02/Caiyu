const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, dbpw } = require('./config.json');
const mysql = require("mysql");

const client = new Discord.Client();

client.commands = new Discord.Collection(); // commands
client.CFGames = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('js'));

cooldowns = new Discord.Collection(); // cooldowns

const defaultCooldown = 3; // other constants

for(const f of commandFiles) {
    const command = require(`./commands/${f}`);
    client.commands.set(command.name, command);
}

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: dbpw,
    database: "caiyu"
})
con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
})

client.on('ready', () => {
    client.user.setPresence({ 
        activity: { name: '-c help' }, 
        status: 'available' 
    });
    console.log('Ready!');
});

client.on('message', message => {
    if (message.author.bot) return;
    con.query(`SELECT * FROM coins WHERE id = '${message.author.id}' AND server = '${message.guild.id}'`, (err, entry) => {
        if (err) throw err;
        if (entry.length == 0) {
            con.query(`INSERT INTO coins (id, coins, server) VALUES ('${message.author.id}', 0, '${message.guild.id}')`);
        }
        if (!message.content.startsWith(prefix)) return;
        const args = message.content.slice(prefix.length).trim().split(' ');
        const commandName = args.shift().toLowerCase();
        if (client.commands.has(commandName)) {
            const command = client.commands.get(commandName);
            if (!cooldowns.has(message.guild.id)) {
                cooldowns.set(message.guild.id, new Discord.Collection());
            }
            if (!cooldowns.get(message.guild.id).has(command.name)) {
                cooldowns.get(message.guild.id).set(command.name, new Discord.Collection());
            }

            const cur = Date.now();
            const timestamps = cooldowns.get(message.guild.id).get(command.name);
            const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                if (cur < expirationTime) {
                    const timeLeft = (expirationTime - cur) / 1000;
                    return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing \`${prefix + command.name}\`.`);
                }
            }
            timestamps.set(message.author.id, cur);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

            try {
                command.execute(message, args, con);
            } catch (error) {
                console.error(error);
                message.reply('something went wrong executing your command.');
            }
        }
    });
});

client.login(token);