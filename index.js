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

const BOT = {
    NAME: 'ryth',
    OWNER: 'Hukak He Pak',
    PHRASE: {
        MEMBER: {
            JOIN: '',
            LEAVE: '',
        }
    },

    GUILD: {
        MEMBER: {
            WELCOME: 'Congratulations and welcome to the server! I believe that a strong group of People can do much more together and surpass what an individual can do alone',
            BYE: '',
        }
    },
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES],
});

let connection = undefined;

const player = new Player(client);

player.on("trackStart", (queue, track) => queue.metadata.channel.send(`🎶    |   Now playing ** ${track.title} **!`))

client.once("ready", () => {
    console.log("I'm ready!");
});

/////////////////////////////////////////////////////////

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'react':
            const message = await interaction.reply({ content: 'You can react with Unicode emojis!', fetchReply: true });
            message.react('😄');
            break;
        case 'test':
            interaction.reply('status: ok');
            //console.log(interaction);
            break;

    }
});

client.on('guildMemberAdd', action => {
    action.reply(BOT.PHRASE.MEMBER.JOIN);
});

client.on('guildMemberRemove', action => {
    action.reply('We have lost a worthy fighter. Rest in peace...');
});

client.on('messageCreate', async message => {
    if(message.author.bot) return;

    const messageContent = message.content.trim().toLowerCase();
    const userName = message.author.username;

    if(messageContent.includes(BOT.NAME)) {

    }

    switch (messageContent) {
        case `hi, ${BOT.NAME}`:
            message.reply('Hi ' + userName + ', glad to see you! 😄');
            break;

        case `${BOT.NAME}.play`:

            const queue = player.createQueue(message.guild, {
                metadata: {
                    channel: message.channel
                }
            });

            await  queue.connect(message.member.voice.channel);

            const track = new Track(player, { url: 'https://www.youtube.com/watch?v=w3LWHIz3bMc', source: 'youtube'});

            await queue.play(track);

            if(userName === BOT.OWNER) message.reply('Oh, yes, my overlord');

            break;

        case `${BOT.NAME}.dream`:

            console.log('bot stop');
            await message.reply('Bye ☺️');

            if(connection)  {
                connection.disconnect();
                connection = undefined;
            }

            client.destroy();
            process.exit();
            break;

        case `${BOT.NAME}.stop`:
            if(connection)  {
                connection.disconnect();
                connection = undefined;
                message.reply('')
            }
            break;

        case '🍌':
            message.reply('💦');
            break;

    }
});

client.login(token);

// TODO: replace admin name in global, add audio-streams support, add link music support, add vk playlist music support,
// TODO: create server playlists, add some radios, create music manager, fix connection destroy null exceptions

// now //restart stream-play every source finish
// TODO: fix stream ends, add