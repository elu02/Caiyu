const { prefix } = require('../config.json');

const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Descrption of commands', 
    arguments: '<command>',
    cooldown: 3,
    execute(message, args) { 
        const { commands } = message.client;
        if(!args.length) {
            const output = new Discord.MessageEmbed()
                .setColor('#edc35a')
                .setAuthor('Caiyu', 'https://i.imgur.com/Bpyww2M.png', 'https://i.imgur.com/Bpyww2M.png')
                .setDescription('A bot that does some stuff')
                .addField('list of commands', commands.map(cmd => cmd.name).join(', '))
                .addField('for more help', `type ${prefix}help {some command} for more information on some command`);
            message.channel.send(output);
        }
        else {
            if(!commands.has(args[0])) return;
            command = commands.get(args[0]);
            const output = new Discord.MessageEmbed()
                .setColor('#edc35a')
                .setTitle(`${prefix}${command.name} ${command.arguments}`)
                .addField('description', command.description);
            message.channel.send(output);
        }
    }
}