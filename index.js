const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

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

client.on('ready', () => {
    client.user.setPresence({ 
        activity: { name: '-c help' }, 
        status: 'available' 
    });
    console.log('Ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();
    if(client.commands.has(commandName)){
        const command = client.commands.get(commandName);
        if(!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }

        const cur = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

        if(timestamps.has(message.author.id)){
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if(cur < expirationTime) {
                const timeLeft = (expirationTime - cur) / 1000;
                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing \`${prefix + command.name}\`.`);
            }
        }
        timestamps.set(message.author.id, cur);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('something went wrong executing your command.');
        }
    }
});

client.login(token);