const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const ytdl = require('ytdl-core');
const { Player, Track } = require("discord-player");

const client = new Client({ intents: [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES],
});

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
        HELP: 'Do you need a help? Ha-ha!',

    },
    COMMANDS: ['play', 'skip', 'pause', 'stop', 'back', 'to', 'remove', 'skip', 'list', 'help', 'dream', 'add'],
    DEFAULT: {
        TRACK_URL: 'https://www.youtube.com/watch?v=Un8KYOf6x9U',
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
                if (+title <= BOT.PLAYLIST.size) {
                    const tracks = (Array.from(BOT.PLAYLIST.values())).slice(+title - 1);
                    queue.clear();
                    queue.addTracks(tracks);
                    queue.play();
                }
                return;

            case 'play':
                if(queue.connection.paused) queue.setPaused(false);
                return;

            case 'add':
                const track = queue.current;
                if (track) BOT.PLAYLIST.set(title ? title : track.title, track);
                return;
        }
    }

    switch (command) {
        case 'play':
            try {
                await queue.connect(message.member.voice.channel);
            } catch {
                console.log('Can\'t connect to voice');
                return;
            }

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

            console.log('///////////tracks///////////');

            BOT.PLAYLIST.forEach( (track, name) => {
                trackList += ++count + `\t|\t**${name}**` + (track.raw.duration ? '' : '\t/\tradio') + '\n';
                console.log(track);
            });

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

    if(!queue.connection) await queue.connect(message.member.voice.channel);

    if(url) {
        const track = await createTrack(url);

        if(title) BOT.PLAYLIST.set(title, track);

        queue.play(track);
        return;
    }

    if(title) {
        let track = BOT.PLAYLIST.get(title);

        if(!track) {
            track = await BOT.PLAYER.search(title, {requestedBy: message.author}).then(response => response.tracks[0]);
        }

        queue.play(track);
    }
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

client.login(token);
