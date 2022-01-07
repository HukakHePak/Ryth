const { Client, Intents, VoiceChannel} = require('discord.js');
const { token } = require('./config.json');
//const { createReadStream, createWriteStream } = require('fs');
//const play = require('play-dl');
//const ytdl = require('ytdl-core');
const { Player, Queue, Track } = require("discord-player");
const { createAudioPlayer,
    NoSubscriberBehavior,
    joinVoiceChannel,
    createAudioResource,
    getVoiceConnection,
    getGroups,
    StreamType
} = require('@discordjs/voice');

const client = new Client({ intents: [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES],
});

let connection = undefined;

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
            HELLO: 'Oh, yes, my overlord',
        },
        PLAYER: {
            START(title) { return `🎶 | Now playing **${title}**!`; },
        },
        DREAM: 'Bye ☺️',
        BANANA: '💦',
    },
    PLAYLIST: {
      OPEN: false,
      LAST: '',


    },

    GUILD: {
        MEMBER: {

        }
    },

    PLAYER: undefined,
    QUEUE: undefined,
    PLAYLISTS: [],

}

async function messageReact(message) {
    if (message.author.bot) return;

    const userName = message.author.username;
    const messageCrumbs = message.content.trim().toLowerCase().split(' ');

    switch (messageCrumbs[0]) {
        case BOT.NAME:
            await managePlayer(message, messageCrumbs.slice(1));
            break;
        case '🍌':
            message.reply(BOT.PHRASE.BANANA);
            break;

        case 'hi,':
            if(messageCrumbs[1] === BOT.NAME) message.reply(BOT.PHRASE.MEMBER.HELLO(userName));
            break;

        // check messageCrumbs[1] in playlists/internet search

    }
}

async function managePlayer(message, [ firstCrumb, secondCrumb]) {
    switch (firstCrumb) {
        case 'play':
            startPlayer(message);

            if(message.author.username === BOT.OWNER) message.reply(BOT.PHRASE.OWNER.HELLO);
            break;

        case 'stop':
            if(connection)  {
                connection.disconnect();
                connection = undefined;
                message.reply('')
            }
            break;

        case 'pause':
            break;

        case 'next':
            break;

        case 'prev':
            break;

        case 'open':
            break;

        case 'to':
            break;

        case 'remove':
            break;

        case 'help':
            break;

        case 'dream':
            if(message.author.username === BOT.OWNER) {
                await message.reply(BOT.PHRASE.DREAM);

                client.destroy();
                process.exit();
                return;
            }
            break;

    }
}

async function startPlayer(message) {
    const queue = player.createQueue(message.guild, {
        metadata: {
            channel: message.channel
        }
    });
    await  queue.connect(message.member.voice.channel);
    const track = new Track(player, { title: 'lo-fi', url: 'https://www.youtube.com/watch?v=w3LWHIz3bMc', source: 'youtube'});
    await queue.play(track);
}


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

// TODO: add link music support, add vk playlist music support,
// TODO: create server playlists, add some radios, create music manager, fix connection destroy null exceptions

// now //restart stream-play every source finish
// TODO: fix stream ends