const config = require('../config.json');

const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    name: 'help',
    async execute(interaction) {
        const { commandName, options } = interaction

        const commands = [
            "**/help** - Muestra esta lista de comandos",
            "\n**Permissions:** Everyone\n",
            "\n**/verificarme** *{userid:required}* - Conecta tu cuenta de roblox con la de Discord",
            "\n**Permissions:** Everyone\n",
            "\n**/actualiza** *{user:optional}* - Actualiza el nombre de usuario de Discord del usuario si su nombre de usuario de Roblox ha cambiado.",
            "\n**Permissions:** Everyone\n",
            "\n**/mirar** *{user:optional}* -  Muestra información sobre el usuario",
            "\n**Permissions:** Everyone\n",
        ];

        var commandString = commands.join('')

        const response1 = new MessageEmbed()
            .setTitle('Commands')
            .setDescription(`${commandString}`)
            .setColor('0x5d65f3');

        return interaction.reply({ embeds: [response1], ephemeral: true  });
    },
};