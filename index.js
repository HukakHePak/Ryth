require('dotenv').config();
const { Client, Intents } = require('discord.js');
const ytdl = require('ytdl-core');
const { Player, Track } = require("discord-player");

const client = new Client({ intents: [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES],
});

const BOT = {
    NAME: process.env.BOT_NAME,
    OWNER: process.env.BOT_OWNER,
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
            PLAY: 'Player always play',
            ADD: 'Track added on queue',
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
        HELP: 'ryth play - connect to voice and start list \n'
        + 'ryth < track > - add track from list in queue or search on youtube \n'
        + 'ryth < url > - add track from url in queue\n'
        + 'ryth < url > < name > - add named track from url in list\n'
        + 'ryth add < name > - add named track from player in list\n'
        + 'ryth add - add track with default name\n'
        + 'ryth list - show list tracks\n'
        + 'ryth remove < id / name > - remove track from list\n'
        + 'ryth to < id / name > - play current track from list\n'
        + 'ryth stop / pause / skip / back / help',

    },
    COMMANDS: ['play', 'skip', 'pause', 'stop', 'back', 'to', 'remove', 'skip', 'list', 'help', 'dream', 'add'],
    DEFAULT: {
        TRACK_URL: process.env.DEFAULT_TRACK_URL,
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

            if(!BOT.QUEUE || BOT.QUEUE.destroyed)
                BOT.QUEUE = BOT.PLAYER.createQueue(message.guild, { metadata: { channel: message.channel }, leaveOnEnd: false });

            managePlayer(message, crumbs);
            break;

        case '🍌':
            message.reply(BOT.PHRASE.BANANA);
            break;

        case 'hi,':
            if(message.content.toLowerCase().includes(BOT.NAME))
                message.reply(BOT.PHRASE.MEMBER.HELLO(message.author.username));
            break;
    }
}

async function managePlayer(message, { command, title, url }) {
    const queue = BOT.QUEUE;

    if (queue.playing) {
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
                if (+title <= BOT.PLAYLIST.size) {
                    const tracks = (Array.from(BOT.PLAYLIST.values())).slice(+title - 1);
                    queue.clear();
                    queue.addTracks(tracks);
                    queue.play();
                }
                return;

            case 'play':
                if (queue.connection.paused) queue.setPaused(false);
                return;

            case 'add':
                const track = queue.current;
                if (track) BOT.PLAYLIST.set(title ? title : track.title, track);
                return;
        }
    }
    switch (command) {
        case 'remove':
            if (+title) {
                const key = Array.from(BOT.PLAYLIST.keys())[+title - 1];
                BOT.PLAYLIST.delete(key);
                return;
            }

            BOT.PLAYLIST.delete(title);
            return;

        case 'list':
            if (!BOT.PLAYLIST.size) {
                message.reply(BOT.PHRASE.TRACK.LIST_EMPTY);
                return;
            }

            let trackList = '';
            let count = 0;

            BOT.PLAYLIST.forEach((track, name) => {
                trackList += ++count + `\t|\t**${name}**` + (track.raw.duration ? '' : '\t/\tradio') + '\n';
            });

            if (trackList) message.reply(trackList);
            return;

        case 'help':
            message.reply(BOT.PHRASE.HELP);
            return;

        case 'dream':
            if (message.author.username === BOT.OWNER) {
                await message.reply(BOT.PHRASE.DREAM);
                if (queue.playing) queue.stop();
                client.destroy();
                process.exit();
            }
            return;
    }

    if (message.member.voice.channel) {
        switch (command) {
            case 'play':
                try {
                    await queue.connect(message.member.voice.channel);
                } catch {
                    console.log('Can\'t connect to voice');
                    return;
                }

                if (message.author.username === BOT.OWNER) message.reply(BOT.PHRASE.OWNER.PLAY);

                if (BOT.PLAYLIST.size) {
                    queue.addTracks(Array.from(BOT.PLAYLIST.values()));
                    queue.play();
                    return;
                }

                if (!queue.tracks.length) {
                    queue.play(await createTrack(BOT.DEFAULT.TRACK_URL));
                    return;
                }

                message.reply(BOT.PHRASE.PLAYER.PLAY);
                return;

            case 'stop':
                if (queue.connection) queue.stop();
                return;
        }

        if (command) return;

        if (!queue.connection) await queue.connect(message.member.voice.channel);

        if (url) {
            const track = await createTrack(url);

            if (title) BOT.PLAYLIST.set(title, track);

            queue.play(track);
            return;
        }

        if (title) {
            let track = BOT.PLAYLIST.get(title);

            if (!track) {
                track = await BOT.PLAYER.search(title, {requestedBy: message.author}).then(response => response.tracks[0]);
            }

            queue.play(track);
        }
    } else
        message.reply(BOT.PHRASE.VOICE.DISCONNECT);
}

async function createTrack(url) {
    const trackInfo = await ytdl.getInfo(url).then(info => info.videoDetails);
    return new Track(BOT.PLAYER, { title: trackInfo.title, url, source: 'youtube', duration: trackInfo.lengthSeconds });
}

function isUrl(url) {
    return url.includes('http') || url.includes('youtube');
}

BOT.PLAYER.on("connectionError", queue => {
    const track = queue.previousTracks[0];
    if(!track.raw.duration) {
        queue.play(track);
        console.log('live restarted');
    }
});

BOT.PLAYER.on("queueEnd", queue => {
    if (BOT.PLAYLIST.size) {
        queue.addTracks(Array.from(BOT.PLAYLIST.values()));
        queue.play();
    }
});

BOT.PLAYER.on("trackAdd", (queue, track) =>
    queue.metadata.channel.send(BOT.PHRASE.PLAYER.ADD)
);

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

client.login(process.env.BOT_TOKEN);
