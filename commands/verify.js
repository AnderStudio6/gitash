const config = require('../config.json');

const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const snekfetch = require('snekfetch');
const firebase = require('firebase');

module.exports = {
    name: 'verificarme',
    async execute(interaction) {
        const { options } = interaction
        const member = interaction.member.user.id

        const verifiedRole = interaction.guild.roles.cache.find(role => role.name === config.verifiedRole);

        if (interaction.member.roles.cache.some(role => role.name === config.verifiedRole)) {
            return interaction.reply({ content: 'Ya está verificado. Considere ejecutar /actualiza en su lugar.', ephemeral: true });
        }

        var { body } = await snekfetch.get(`${config.firebaseURL}verified/${member}.json`)

        if (body) {
            var { body } = await snekfetch.get(`https://users.roblox.com/v1/users/${body.linked}`)
            await interaction.member.roles.add(verifiedRole);

            var displayName

            if (body.displayName === body.name) {
                displayName = body.name;
            } else {
                displayName = body.displayName;
            }
 
            interaction.member.setNickname(`${displayName}`);

            return interaction.reply({ content: `Bienvenido al servidor, ${displayName}!`, ephemeral: true });
        } else {
            const userId = options.getNumber('userid');

            var { body } = await snekfetch.get(`${config.firebaseURL}pending/${userId}.json`)

            if (body) {
                return interaction.reply({ content: 'No puede tener más de una solicitud de verificación activa a la vez.', ephemeral: true });
            } else {
                var { body } = await snekfetch.get(`https://users.roblox.com/v1/users/${userId}`)

                if (!body.name) {
                    return interaction.reply({ content: `${userId} no es un nombre de usuario válido. Compruebe su nombre de usuario e inténtelo de nuevo.`, ephemeral: true });
                }

                var displayName

                if (body.displayName === body.name) {
                    displayName = body.name;
                } else {
                    displayName = body.displayName;
                }

                const page1 = new MessageEmbed()
                    .setTitle('Verificacion')
                    .setDescription(`Para verificar la titularidad de la cuenta, únete al AnderVerify.(${config.verificationLink}).`)
                    .setColor('0x5d65f3');
                const page2 = new MessageEmbed()
                    .setTitle('Verificacion')
                    .setDescription(`Lo sentimos, pero parece que no has completado los pasos del AnderVerify.(${config.verificationLink}). Complete los pasos y haga clic en Siguiente.`)
                    .setColor('0x5d65f3');
                const page3 = new MessageEmbed()
                    .setTitle('Verificacion')
                    .setDescription(`¡Titularidad de la cuenta verificada! Bienvenido al servidor, ${displayName}.`)
                    .setColor('0x5d65f3');
                const page4 = new MessageEmbed()
                    .setTitle('Verificacion')
                    .setDescription(`Verificación de cuenta cancelada. Para intentarlo de nuevo, ejecute /verificarme.`)
                    .setColor('0x5d65f3');
                const page5 = new MessageEmbed()
                    .setTitle('Verificacion')
                    .setDescription(`La verificación ha finalizado. Para volver a intentarlo, ejecute /verificarme.`)
                    .setColor('0x5d65f3');
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('verification_code_next')
                        .setLabel('Siguiente')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('verification_cancel')
                        .setLabel('Cancelar')
                        .setStyle('DANGER')
                );

                firebase.database().ref(`pending/${userId}`).set(member)

                interaction.reply({ embeds: [page1], components: [row], ephemeral: true }).then(message => {
                    const filter = i => i.user.id === member;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 300000 });

                    collector.on('collect', async i => {
                        i.deferUpdate();

                        if (i.customId === 'verification_code_next') {
                            var { body } = await snekfetch.get(`${config.firebaseURL}verified/${member}.json`)

                            if (body) {
                                await interaction.member.roles.add(verifiedRole);

                                interaction.member.setNickname(`${body.username}`);

                                return interaction.editReply({ embeds: [page3], components: [], ephemeral: true });
                            } else {
                                return interaction.editReply({ embeds: [page2], components: [row], ephemeral: true });
                            };
                        } else if (i.customId === 'verification_cancel') {
                            var { body } = await snekfetch.get(`${config.firebaseURL}pending/${userId}.json`)

                            if (body) {
                                firebase.database().ref(`pending/${userId}`).set({})
                            }

                            return interaction.editReply({ embeds: [page4], components: [], ephemeral: true });
                        };
                    });

                    collector.on('end', async i => {
                        var { body } = await snekfetch.get(`${config.firebaseURL}pending/${userId}.json`)

                        if (body) {
                            firebase.database().ref(`pending/${userId}`).set({})
                        }

                        return interaction.editReply({ embeds: [page5], components: [], ephemeral: true });
                    });
                });
            }
        }
    },
};