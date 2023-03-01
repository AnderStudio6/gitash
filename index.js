const config = require('./config.json');

const { readdirSync } = require('fs');
const { Client, Collection} = require('discord.js');

const client = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS', 'GUILD_VOICE_STATES', 'GUILD_PRESENCES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'],
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});

const firebase = require('firebase');
const firebaseConfig = {
    databaseURL: `${config.firebaseURL}`,
};
firebase.initializeApp(firebaseConfig)

client.commands = new Collection();
const commands = readdirSync("./commands/").filter(file => file.endsWith(".js"));

for (const file of commands) {
    try {
        const props = require(`./commands/${file}`);
        client.commands.set(props.name, props);
    } catch (e) {
        console.error(`Unable to load command ${file}: ${e}`);
    }
}

client.once('ready', () => {
    client.user.setActivity('verificate para poder acceder', { type: 'WATCHING' });

    let slashCommands

    slashCommands = client.application?.commands

    slashCommands?.create({
        name: 'help',
        description: 'Shows command list.'
    })

    slashCommands?.create({
        name: 'verificarme',
        description: 'Verificacion del usuario.',
        options: [
            {
                name: 'userid',
                description: 'Tu userID',
                required: true,
                type: 'NUMBER'
            }
        ]
    })

    slashCommands?.create({
        name: 'actualiza',
        description: 'Actualiza los roles del usuario.',
        options: [
            {
                name: 'user',
                description: 'El usuario de discord.',
                required: false,
                type: 'USER'
            }
        ]
    })

    slashCommands?.create({
        name: 'mirar',
        description: 'Acualiza los nombres y roles del usuario.',
        options: [
            {
                name: 'user',
                description: 'El usuario de Discord del user.',
                required: false,
                type: 'USER'
            }
        ]
    })

});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const { commandName } = interaction
        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(config.botToken)