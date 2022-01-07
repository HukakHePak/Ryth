/////////////////////////////////////////////////////////   REMOVE COMMANDS

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

///////////////////////////////////////////////////////////