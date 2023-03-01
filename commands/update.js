const config = require('../config.json');

const snekfetch = require('snekfetch');

async function update(interaction, user) {
    var { body } = await snekfetch.get(`${config.firebaseURL}/verified/${user.id}.json`)

    if (!body) {
        return interaction.reply({ content: '¡Debe estar verificado antes de ejecutar /actualiza! Para verificar, ejecute /verificarme.', ephemeral: true });
    }

    var { body } = await snekfetch.get(`https://users.roblox.com/v1/users/${body.linked}`)

    const currentName = interaction.member.displayName
    var displayName

    if (body.displayName === body.name) {
        displayName = body.name;
    } else {
        displayName = body.displayName;
    }

    if (interaction.member.displayName !== displayName) {
        interaction.member.setNickname(`${displayName}`);

        return interaction.reply({ content: `Nombre de usuario actualizado a ${displayName} de ${currentName}.`, ephemeral: true })
    } else {
        return interaction.reply({ content: 'Tu nombre de usuario ya está actualizado.', ephemeral: true })
    }
}

module.exports = {
    name: 'actualiza',
    async execute(interaction) {
        const { options } = interaction
        const user = options.getUser('user')

        if (user) {
            update(interaction, user)
        } else {
            update(interaction, interaction.member.user)
        }
    },
};