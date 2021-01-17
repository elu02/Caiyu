module.exports = {
    name: 'ping',
    description: 'pong',
    arguments: '',
    cooldown: 1,
    execute(message, args){
        return message.channel.send('pong');
    }
}