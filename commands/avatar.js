module.exports = {
    name: 'avatar',
    description: 'get a user(s)\'s profile picture',
    arguments: '<@user-1> <@user-2> ... ',
    cooldown: 3,
    execute(message, args){
        function getUserFromMention(mention){
            if(!mention) return;
            
            if(mention.startsWith('<@') && mention.endsWith('>')) {
                mention = mention.slice(2, -1);
                if(mention.startsWith('!')){
                    mention = mention.slice(1);
                }
                return message.client.users.cache.get(mention);
            }
        }
        
        function getUserList(args){
            let ar = [];
            for(const x of args){
                const user = getUserFromMention(x);
                if(!user) continue;
                ar.push(`**${user.username}'s Profile Picture:** ${user.displayAvatarURL({format: "png", dynamic: true})}?size=512`);
            }        
            return ar;
        }
        const userList = getUserList(args);
        if(userList.length){
            if(userList.length>10) return message.channel.send('Please do not try to get the avatar of more than 10 people at a time');
            return message.channel.send(userList);
        }
        return message.channel.send(`**Your Profile Picture:** ${message.author.displayAvatarURL({format: "png", dynamic: true})}?size=512`);
    }
}