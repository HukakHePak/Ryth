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
            HELLO(userName) { return 'Hi ' + userName + ', glad to see you! 😄'},
        },
        OWNER: {
            PLAY: 'Oh, yes, my **master**',
        },
        PLAYER: {
            START(title) { return `🎶 | Now playing **${title}**!`; },
            STOP: 'Player stopped',
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
    COMMANDS: ['play', 'skip', 'stop', 'back', 'to', 'remove', 'skip', 'list', 'help', 'dream', 'add'],
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
    const playlist = BOT.PLAYLIST;

    if(queue.playing) {
        switch (command) {
            case 'stop':
                queue.stop();
                //console.log(BOT.QUEUE);
                //queue.connection = undefined;
                return;

            case 'pause':
                queue.setPaused(true);
                return;

            case 'remove':
                playlist.delete(title);
                return;

            case 'add':
                const track = queue.current;
                if (track) return;

                playlist.set(title ? title : track.title, track);
                console.log(playlist)
                return;

            case 'skip':
                if (queue.tracks.length) queue.skip();
                return;

            case 'back':
                if (queue.previousTracks.length) queue.back();
                return;

            case 'to':
                if (+title < queue.tracks.length) queue.jump(+title);
                return;

            case 'play':
                if(queue.connection.paused) queue.setPaused(false);
                return;
        }
    }
    console.log(queue.playing);
    console.log(queue.destroyed);

    switch (command) {
        case 'play':
            await queue.connect(message.member.voice.channel);

            if(message.author.username === BOT.OWNER) message.reply(BOT.PHRASE.OWNER.PLAY);

            if(!queue.tracks.length) {
                queue.play(await createTrack(BOT.DEFAULT.TRACK_URL));
                return;
            }

            if(playlist.size) {
                queue.addTracks(Array.from(playlist.values()));
            }

            queue.play();
            return;

        case 'list':
            if( !playlist.size) {
                message.reply(BOT.PHRASE.TRACK.LIST_EMPTY);
                //return;
            }

            let test = new Map();
            test.set('t', 't')
            console.log(test);

            let trackList = '';
            let count = 0;

            playlist.forEach( track => trackList += count++ + ' | ' + track.title + '\n' );

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

    await queue.connect(message.member.voice.channel);

    let track = undefined;

    if(url) {
        track = await createTrack(url);

        if(title) {
            playlist.set(title, track);
            queue.clear();
            queue.play(track);
            return;
        }

        queue.addTrack(track);
        queue.play();
    }

    if(title) {
        track = BOT.PLAYLIST.get(title);

        if(!track)
            track = await BOT.PLAYER.search(title, { requestedBy: message.author }).then(response => response.tracks[0]);

        queue.addTrack(track);
        queue.play();
    }
}

async function createTrack(url) {
    const trackInfo = await ytdl.getInfo(url).then(info => info.videoDetails);
    return new Track(BOT.PLAYER, { title: trackInfo.title, url, source: 'youtube' });
}

function isUrl(url) {
    return url.includes('http') || url.includes('youtube');
}

BOT.PLAYER.on("trackEnd", (queue, track) => {
    if(track.raw.live) queue.play(track);
});

BOT.PLAYER.on("trackStart", (queue, track) =>
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
// TODO: fix multi word track names detecting, add normal crumber (not lower links and track names), fix play restart mute
