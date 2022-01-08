const { Client, Intents, VoiceChannel} = require('discord.js');
const { token } = require('./config.json');
//const { playlists } = require('./playlists.json');
//const { createReadStream, createWriteStream } = require('fs');
//const play = require('play-dl');
const ytdl = require('ytdl-core');
const { Player, Track } = require("discord-player");
// const { createAudioPlayer,
//     NoSubscriberBehavior,
//     joinVoiceChannel,
//     createAudioResource,
//     getVoiceConnection,
//     getGroups,
//     StreamType
// } = require('@discordjs/voice');

const client = new Client({ intents: [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES],
});

let connection = undefined;
let queue = undefined;
let radios = [];

const player = new Player(client);

const BOT = {
    NAME: 'ryth',
    OWNER: 'Hukak He Pak',
    PHRASE: {
        MEMBER: {
            JOIN: 'Congratulations and welcome to the server! I believe that a strong group of People can do much more together and surpass what an individual can do alone',
            LEAVE: 'We have lost a worthy fighter. Rest in peace...',
            HELLO(userName) { return 'Hi ' + userName + ', glad to see you! 😄'},
        },
        OWNER: {
            PLAY: 'Oh, yes, my overlord',
        },
        PLAYER: {
            START(title) { return `🎶 | Now playing **${title}**!`; },
            STOP: 'Player stopped',
        },
        DREAM: 'Bye ☺️',
        BANANA: '💦',
        HELP: '',

    },
    COMMANDS: ['play', 'skip', 'stop', 'back', 'to', 'remove', 'skip', 'list', 'help', 'dream'],
    GUILD: {
        QUEUE: undefined,
        LIST: undefined,
    },
    //PLAYER: new Player(client),
}

function parseContent(content) {
    let crumbs = content.trim().split(' ');
    const botName = crumbs[0].toLowerCase();
    let command = crumbs[1].toLowerCase();
    let trackName = crumbs[2];

    if(!BOT.COMMANDS.includes(command)) {
        command = undefined;
        trackName = crumbs.filter(crumb => {
            return crumb !== BOT.NAME && !isUrl(crumb);
        }).join(' ');
    }
    const url = crumbs.find(isUrl);

    return { botName, command, trackName, url };
}

async function messageReact(message) {
    if (message.author.bot) return;

    const userName = message.author.username;
    const crumbs = parseContent(message.content);

    console.log(crumbs);

    switch (crumbs.botName) {
        case BOT.NAME:
            await managePlayer(message, crumbs);
            break;
        case '🍌':
            message.reply(BOT.PHRASE.BANANA);
            break;

        case 'hi,':
            if(message.content.includes(BOT.NAME)) message.reply(BOT.PHRASE.MEMBER.HELLO(userName));
            break;
    }
}

async function managePlayer(message, { command, trackName, url }) {
    switch (command) {
        case 'play':
            startPlayer(message);

            //queue.play();
            if(message.author.username === BOT.OWNER) message.reply(BOT.PHRASE.OWNER.PLAY);
            return;

        case 'stop':
            queue.stop();
            queue.jump(0);
            // if(connection)  {
            //     stopPlayer();
            //     message.reply(BOT.PHRASE.PLAYER.STOP)
            // }
            return;

        // case 'pause':
        //    queue.stop();
        //     return;

        case 'skip':
            queue.skip();
            return;

        case 'back':
            queue.back();
            return;

        case 'to':
            queue.jump(trackName);
            return;

        case 'remove':
            queue.remove(trackName);
            //radios.filter()
            return;

        case 'list':
            // queue.tracks.forEach( track => console.log(track.title) );
            // console.log(queue.tracks);
            return;

        case 'help':
            return;

        case 'dream':
            if(message.author.username === BOT.OWNER) {
                await message.reply(BOT.PHRASE.DREAM);
                stopPlayer();
                stopClient();
            }
            return;
        default:
            break;
    }

    if(url) {
        const trackInfo = await ytdl.getInfo(url).then(info => info.videoDetails);
        const track = new Track(player, { title: trackName ? trackName : trackInfo.title, url: url, source: 'youtube' });

        if(trackInfo.isLiveContent) {
            radios.push(track);
            queue.play(track);
        } else {
            queue.addTrack(track);
            queue.jump(track);
        }

    } else if (trackName) {
        let isCurrentTrack = track => track.title === trackName;

        let track = radios.find(isCurrentTrack);

        if(track) queue.play(track);
        else {
            track = queue.tracks.find(isCurrentTrack);
            if(track) queue.jump(track);
            else {
                track = await player.search(trackName, { requestedBy: message.author }).then(response => response.tracks[0]);
                queue.addTrack(track);
                queue.jump(track);
            }
        }
    }


}

function isUrl(url) {
    return url.includes('http') || url.includes('youtube');
}

function stopPlayer() {
    if(connection){
        connection.destroy();
        connection = undefined;
    }
}

function stopClient() {
    client.destroy();
    process.exit();
}

async function startPlayer(message) {
    queue = player.createQueue(message.guild, {
        metadata: {
            channel: message.channel
        }
    });
    connection = await queue.connect(message.member.voice.channel);

    const name = await ytdl.getInfo('https://www.youtube.com/watch?v=w3LWHIz3bMc').then(info => info.videoDetails.title);
    const track = new Track(player, { title: name, url: 'https://www.youtube.com/watch?v=w3LWHIz3bMc', source: 'youtube'});

    await queue.play(track);
}

// player.on('queueEnd', queue => {
//     queue.play();
// });

player.on("trackEnd", queue => {

});

player.on("trackStart", (queue, track) =>
    queue.metadata.channel.send(BOT.PHRASE.PLAYER.START(track.title))
);

client.on('messageCreate', messageReact);

client.on('guildMemberAdd', action => {
    action.reply(BOT.PHRASE.MEMBER.JOIN);
});

client.on('guildMemberRemove', action => {
    action.reply(BOT.PHRASE.MEMBER.LEAVE);
});

client.once("ready", () => {
    console.log("I'm ready!");
});

client.login(token);

// TODO: fix: connection destroy null exceptions, restart radio onerror, add: player controls, playlists, radios, find track, fix connect timeout error
// TODO: fix multi word track names detecting, add normal crumber (not lower links and track names)
