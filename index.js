const { Client, Intents, VoiceChannel} = require('discord.js');
const { token } = require('./config.json');
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

// let connection = undefined;
// let queue = undefined;
//
// const player = new Player(client);

const BOT = {
    NAME: 'ryth',
    OWNER: 'Hukak He Pak',
    PHRASE: {
        MEMBER: {
            JOIN: 'Congratulations and welcome to the server! I believe that a strong group of People can do much more together and surpass what an individual can do alone',
            LEAVE: 'We have lost a worthy fighter. Rest in peace...',
            HELLO(userName) { return 'Hi, **' + userName + '**, glad to see you! 😄'},
        },
        OWNER: {
            PLAY: 'Oh, yes, my **master**',
        },
        PLAYER: {
            START(title) { return `🎶 | Now playing **${title}**!`; },
            STOP: 'Player stopped',
            PLAY: 'Player always play'
        },
        VOICE: {
            DISCONNECT:'Not connect to voice',
            CONNECT: 'Voice always connected'
        },
        TRACK: {
            START: '',
            LIST_EMPTY: 'Playlist is empty'
        },
        DREAM: 'Bye ☺️☺️☺️',
        BANANA: '💦',
        HELP: 'Do you need a help? Ha-ha!',

    },
    COMMANDS: ['play', 'skip', 'pause', 'stop', 'back', 'to', 'remove', 'skip', 'list', 'help', 'dream', 'add'],
    DEFAULT: {
        TRACK_URL: 'https://www.youtube.com/watch?v=w3LWHIz3bMc',
    },

    PLAYLIST: new Map(),
    QUEUE: undefined,
    PLAYER: new Player(client),
}

function parseContent(content) {
    let crumbs = content.trim().split(' ');
    const botName = crumbs[0].toLowerCase();
    let command = crumbs[1] ? crumbs[1].toLowerCase() : undefined;
    let title = crumbs[2];

    if(!BOT.COMMANDS.includes(command)) {
        command = undefined;
        title = crumbs.filter(crumb => {
            return crumb !== BOT.NAME && !isUrl(crumb);
        }).join(' ');
    }
    const url = crumbs.find(isUrl);

    return { botName, command, title, url };
}

async function messageReact(message) {
    if (message.author.bot) return;

    const crumbs = parseContent(message.content);

    switch (crumbs.botName) {
        case BOT.NAME:
            if(!message.member.voice.channel) {
                message.reply(BOT.PHRASE.VOICE.DISCONNECT);
                return;
            }

            if(!BOT.QUEUE || BOT.QUEUE.destroyed)
                BOT.QUEUE = BOT.PLAYER.createQueue(message.guild, { metadata: { channel: message.channel }, repeatMode: 2 });

            managePlayer(message, crumbs);
            break;

        case '🍌':
            message.reply(BOT.PHRASE.BANANA);
            break;

        case 'hi,':
            if(message.content.toLowerCase().includes(BOT.NAME))
                message.reply(BOT.PHRASE.MEMBER.HELLO(message.author.username));
            break;
        case 'inf':
            //console.log(BOT.DEFAULT.TRACK);
            break;
    }
}

async function managePlayer(message, { command, title, url }) {
    const queue = BOT.QUEUE;

    if(queue.playing) {
        switch (command) {
            case 'pause':
                queue.setPaused(true);
                return;

            case 'skip':
                if (queue.tracks.length) queue.skip();
                return;

            case 'back':
                if (queue.previousTracks.length > 1) queue.back();
                return;

            case 'to':
                if (+title < queue.tracks.length) queue.jump(+title - 1);
                return;

            case 'play':
                if(queue.connection.paused) queue.setPaused(false);
                return;

            case 'add':
                const track = queue.tracks? queue.tracks[queue.tracks - 1] : queue.current;
                if (track) BOT.PLAYLIST.set(title ? title : track.title, track);
                return;
        }
    }

    switch (command) {
        case 'play':
            await queue.connect(message.member.voice.channel);

            if(message.author.username === BOT.OWNER) message.reply(BOT.PHRASE.OWNER.PLAY);

            if(BOT.PLAYLIST.size) {
                queue.addTracks(Array.from(BOT.PLAYLIST.values()));
                queue.play();
                return;
            }

            if(!queue.tracks.length) {
                queue.play(await createTrack(BOT.DEFAULT.TRACK_URL));
                return;
            }

            message.reply(BOT.PHRASE.PLAYER.PLAY);
            return;

        case 'stop':
            if(queue.connection) queue.stop();
            return;

        case 'remove':
            if(+title) {
                const key = Array.from(BOT.PLAYLIST.keys())[+title - 1];
                BOT.PLAYLIST.delete(key);
                return;
            }

            BOT.PLAYLIST.delete(title);
            return;


        case 'list':
            if( !BOT.PLAYLIST.size) {
                message.reply(BOT.PHRASE.TRACK.LIST_EMPTY);
                return;
            }

            let trackList = '';
            let count = 0;

            BOT.PLAYLIST.forEach( track => trackList += count++ + '\t|\t' + track.title + '\n' );

            if(trackList) message.reply(trackList);
            return;

        case 'help':
            message.reply(BOT.PHRASE.HELP);
            return;

        case 'dream':
            if(message.author.username === BOT.OWNER) {
                await message.reply(BOT.PHRASE.DREAM);
                if(queue.playing) queue.stop();
                client.destroy();
                process.exit();
            }
            return;
    }

    if(command) return;

    if(url) {
        await queue.connect(message.member.voice.channel);
        const track = await createTrack(url);

        if(title) {
            BOT.PLAYLIST.set(title, track);
            queue.clear();
            queue.play(track);
            return;
        }
    }

    if(title) {
        await queue.connect(message.member.voice.channel);
        let track = BOT.PLAYLIST.get(title);

        if(!track)
            track = await BOT.PLAYER.search(title, { requestedBy: message.author }).then(response => response.tracks[0]);
    }
    queue.addTrack(track);
    queue.play();
}

async function createTrack(url) {
    const trackInfo = await ytdl.getInfo(url).then(info => info.videoDetails);
    return new Track(BOT.PLAYER, { title: trackInfo.title, url, source: 'youtube' });
}

function isUrl(url) {
    return url.includes('http') || url.includes('youtube');
}

BOT.PLAYER.on("trackEnd", (queue, track) => {
    if(track.raw.live) {
        BOT.QUEUE = BOT.PLAYER.createQueue(queue.guild, { metadata: { channel: queue.channel }, repeatMode: 2 });
        BOT.QUEUE.play(track);
        console.log('track restarted');
    }
});

BOT.PLAYER.on("trackStart", (queue, track) =>
    queue.metadata.channel.send(BOT.PHRASE.PLAYER.START(track.raw.title))
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
// TODO: fix multi word track names detecting, add normal crumber (not lower links and track names), fix play restart mute
