import {SlashCommandBuilder, PermissionFlagsBits} from 'discord.js'

import {db} from '../index.js'

export const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Mit dem Befehl kannst du den Bot einrichten')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option => {
        option
            .setName('gastrolle')
            .setDescription('Nutzer mit der Rolle werden nach der eingestellten Zeit automatisch gekickt')
            .setRequired(true);
        return option;
    })
    .addNumberOption(option => 
        option
            .setName('zeit')
            .setDescription('Zeit in Minuten nachdem Spieler mit der Gastrolle gekickt werden')
            .setRequired(true)
    )

export async function execute (interaction) {
    const guild = interaction.guild.id;
    const role = interaction.options.getRole('gastrolle').id;
    const time = interaction.options.getNumber('zeit');

    db.exec(`DELETE FROM guilds WHERE id = '${guild}'`);
    db.exec(`INSERT INTO guilds (id, role, time) VALUES ('${guild}', '${role}', ${time})`, (e) => {if(e) console.log(e)});

    await interaction.reply(`Nutzer mit der Rolle <@&${role}> werden nach ${time} Minuten nach Beitritt gekickt.`);
} 

export default {
    data, execute,
}