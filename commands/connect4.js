const Discord = require("discord.js");

function getUserFromMention(mention, message){
    if(!mention) return;
    
    if(mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
        if(mention.startsWith('!')){
            mention = mention.slice(1);
        }
        return message.client.users.cache.get(mention);
    }
}

function print(board) {
    let ret = '';
    for(const row of board) {
        for(const x of row) {
            if(x == 0) ret += '⚫ ';
            else if(x == 1) ret += '🟡 ';
            else ret += '🔴 ';
        }
        ret += '\n'
    }
    ret += '1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣'
    return ret;
}

function upd(b, col) {
    for(let i = 5; i >= 0; i--) {
        if(!b[i][col]) {
            return {first: i, second: col};
        }
    }
    return {first: -1, second: -1};
}

function valid(row, col) {
    return row >= 0 && col >= 0 && row < 6 && col < 7;
}

function checkWin(b, row, col) {
    const dy = [0, 1, 1, -1];
    const dx = [1, 0, -1, -1];
    let ok = true;
    for(let j = 0; j < 4; j++) {
        const nx = row + dx[0] * j;
        const ny = col + dy[0] * j;
        if(!valid(nx, ny) || b[nx][ny] != b[row][col]) {
            ok = false;
        }
    }
    if(ok) return true;
    for(let i = 0; i < 4; i++) {
        ok = true;
        for(let j = 0; j < 4; j++) {
            const nx = row + dx[1] * j;
            const ny = col + dy[1] * j - i;
            if(!valid(nx, ny) || b[nx][ny] != b[row][col]) {
                ok = false;
            }
        }
        if(ok) return true;
    }
    for(let i = 0; i < 4; i++) {
        ok = true;
        for(let j = 0; j < 4; j++) {
            const nx = row + dx[2] * j + i;
            const ny = col + dy[2] * j - i;
            if(!valid(nx, ny) || b[nx][ny] != b[row][col]) ok = false;
        }
        if(ok) return true;
    }
    for(let i = 0; i < 4; i++) {
        ok = true;
        for(let j = 0; j < 4; j++) {
            const nx = row + dx[3] * j + i;
            const ny = col + dy[3] * j + i;
            if(!valid(nx, ny) || b[nx][ny] != b[row][col]) ok = false;
        }
        if(ok) return true;
    }
    return false;
}

module.exports = {
    name: "connect4",
    description: "get 4 in a row to win",
    arguments: "<@user>",
    cooldown: 3,
    execute(message, args) {
        if(args.length){
            const user = getUserFromMention(args[0], message);
            const CFGames = message.client.CFGames;
            if(!user||user.bot) return message.channel.send("You can only use this command with other users.");
            else if(user === message.author) return message.channel.send("You cannot play with yourself.");
            const gameID = message.author.id + '/' + user.id;
            if(!CFGames.has(gameID)) {
                CFGames.set(gameID, {
                    first: user,
                    second: message.author,
                    turn: 'f',
                    board: new Array(6).fill(0).map(() => new Array(7).fill(0))
                });
            }
            return message.channel.send(`Go ${CFGames.get(gameID).turn == 'f' ? message.author : user} - You have 60 seconds\n${print(CFGames.get(gameID).board)}`).then((botMessage) => {
                botMessage.react('1️⃣');
                botMessage.react('2️⃣');
                botMessage.react('3️⃣');
                botMessage.react('4️⃣');
                botMessage.react('5️⃣');
                botMessage.react('6️⃣');
                botMessage.react('7️⃣');

                const filter = (reaction, user) => {
                    return ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣'].includes(reaction.emoji.name)
                        && ((gameID.split('/')[0] == user.id && CFGames.get(gameID).turn == 'f') ||
                            (gameID.split('/')[1] == user.id) && CFGames.get(gameID).turn == 's')
                }
                botMessage.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
                    .then(collected => {
                        const reaction = collected.first().emoji.name;
                        const b = CFGames.get(gameID).board;

                        if(reaction == '1️⃣') coord = upd(b, 0);
                        else if(reaction == '2️⃣') coord = upd(b, 1);
                        else if(reaction == '3️⃣') coord = upd(b, 2);
                        else if(reaction == '4️⃣') coord = upd(b, 3);
                        else if(reaction == '5️⃣') coord = upd(b, 4);
                        else if(reaction == '6️⃣') coord = upd(b, 5);
                        else if(reaction == '7️⃣') coord = upd(b, 6);

                        if(valid(coord.first, coord.second)) b[coord.first][coord.second] = (CFGames.get(gameID).turn == 'f' ? 1 : 2);
                        else return this.execute(message, args);

                        if(checkWin(b, coord.first, coord.second)) {
                            const winner = (CFGames.get(gameID).turn == 'f' ? message.author : user);
                            message.channel.send(print(CFGames.get(gameID).board));
                            message.channel.send(`4 in a row! ${winner} wins.`);
                            return CFGames.delete(gameID);
                        }
                        else {
                            if(CFGames.get(gameID).turn == 'f') CFGames.get(gameID).turn = 's';
                            else CFGames.get(gameID).turn = 'f';
                            return this.execute(message, args);
                        }
                    })
                    .catch(() => {
                        if(CFGames.get(gameID).turn == 's') {
                            message.channel.send(`${CFGames.get(gameID).first} has run out of time. ${CFGames.get(gameID).second} has won.`);
                        }
                        else {
                            message.channel.send(`${CFGames.get(gameID).second} has run out of time. ${CFGames.get(gameID).first} has won.`);
                        }
                        return CFGames.delete(gameID);
                    })
            }).catch(error => console.log(error));
        }
        else return message.channel.send("Please mention the user you want to play with after the command.")
    }
}

