const { Client, Intents, VoiceChannel} = require('discord.js');
const { token } = require('./config.json');
const { createReadStream, createWriteStream } = require('fs');
const play = require('play-dl');
const ytdl = require('ytdl-core');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES],
});

const { createAudioPlayer,
    NoSubscriberBehavior,
    joinVoiceChannel,
    createAudioResource,
    getVoiceConnection,
    getGroups,
    StreamType
} = require('@discordjs/voice');

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

// let resource = createAudioResource(createReadStream('./Minelli_-_Rampampam_72874060.mp3'), {
//     inputType: StreamType.Arbitrary,
// });

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
            console.log(interaction);
            break;

    }
});

client.on('guildMemberAdd', action => {
    console.log('member add');

    action.reply('Congratulations and welcome to the server! I believe that a strong ' +
        'group of People can do much more together and surpass what an individual can do alone');
});

client.on('guildMemberRemove', action => {
    console.log('member remove');

    action.reply('We have lost a worthy fighter. Rest in peace...');
});

let connection = undefined;

client.on('messageCreate', async message => {
    if(message.author.bot) return;

    console.log('message read');

    const messageContent = message.content.trim().toLowerCase();
    const userName = message.author.username;

    switch (messageContent) {
        case 'hi, ruth':
            message.reply('Hi ' + userName + ', glad to see you! 😄');
            //message.reply('😄');
            break;
        case 'ruth.play':

            // let resource = await createAudioResource('//ru.hitmotop.com/get/music/20170831/Evanescence_-_Bring_Me_To_Life_47885099.mp3', {
            //     metadata: 'StreamType.Arbitrary',
            // });

            let stream = await play.stream('https://www.youtube.com/watch?v=w3LWHIz3bMc');

            let resource = createAudioResource(stream.stream, { inputType: stream.type} );

            connection = await joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            player.play(resource);

            let counter = 0;

            player.on('stateChange', async playerState => {

                if(playerState.status  === 'buffering') return;

                console.log(counter++ +' ' + playerState.status);

                if(playerState.status === 'playing') {
                    stream = await play.stream('https://www.youtube.com/watch?v=w3LWHIz3bMc');
                    resource = createAudioResource(stream.stream, { inputType: stream.type} );
                    //player.play(resource);
                    console.log(stream);
                }
            });

            const subscription = connection.subscribe(player);

            if(userName === 'Hukak He Pak') message.reply('Oh, yes, my overlord');

            console.log('voice connect');
            console.log('music play');
            break;

        case 'ruth.dream':

            console.log('bot stop');
            await message.reply('Bye ☺️');

            if(connection)  {
                connection.disconnect();
                connection = undefined;
            }

            client.destroy();
            process.exit();
            break;

        case 'ruth.stop':
            if(connection)  {
                connection.disconnect();
                connection = undefined;
            }

            console.log('music stop');
            break;

        case 'ruth.test':
            message.reply('status: ok');
            console.log(message);

            break;

        case '🍌':
            message.reply('💦');
            break;

    }
});

client.login(token);

console.log('bot start');

// TODO: replace admin name in global, add audio-streams support, add link music support, add vk playlist music support,
// TODO: create server playlists, add some radios, create music manager, fix connection destroy null exceptions

// now //restart stream-play every source finish
// TODO: fix stream ends, add