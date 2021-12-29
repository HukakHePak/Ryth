const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on('interactionCreate', async interaction => {
    //if (!interaction.isCommand()) return;

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
})

client.on('guildMemberRemove', action => {
    console.log('member remove');
    action.reply('We have lost a worthy fighter. Rest in peace...');
})

client.on('messageCreate', message => {
    if(message.username === 'Ruth Simple') return;

    console.log('message read');

    switch (message.content) {
        case 'hi, Ruth':
            message.reply('hi ' + message.username + ', glad to see you');
            break;
        case 'ruth.play':

            message.reply('sorry, this feature not realise yet');
            break;

    }
});

client.login(token);