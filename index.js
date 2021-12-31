const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const { join } = require('path');

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
    getVoiceConnection} = require('@discordjs/voice');

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});


//let resource = createAudioResource(join(__dirname, 'Minelli_-_Rampampam_72874060.mp3'));
let resource = createAudioResource('//ru.hitmotop.com/get/music/20170831/Evanescence_-_Bring_Me_To_Life_47885099.mp3');

let connection = undefined;

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'react') {
        const message = await interaction.reply({ content: 'You can react with Unicode emojis!', fetchReply: true });
        message.react('😄');
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

client.on('messageCreate', message => {
    if(message.author.username === 'Ruth Simple') return;

    console.log('message read');

    const messageContent = message.content.trim().toLowerCase();
    const userName = message.author.username;

    switch (messageContent) {
        case 'hi, ruth':
            message.reply('Hi ' + userName + ', glad to see you!');
            message.reply('😄');
            break;
        case 'ruth.play':
            connection = joinVoiceChannel({
                channelId: '925690962783645720',
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            player.play(resource);

            const subscription = connection.subscribe(player);

            if(userName === 'Hukak He Pak') message.reply('Oh, yes, my overlord');
            console.log('voice connect');
            console.log('music play');
            break;
        case 'ruth.dream':
            if(connection) connection.destroy();

            console.log('bot stop');
            client.destroy();
            break;
        case 'ruth.stop':
            if(connection) connection.destroy();
            console.log('music stop');
    }
});

client.login(token);

console.log('bot start');