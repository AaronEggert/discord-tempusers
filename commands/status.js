import {SlashCommandBuilder, PermissionFlagsBits} from 'discord.js'

import {db} from '../index.js'

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Mit dem Befehl kannst du dir den Status von allen (oder einem Bestimten) Gästen anzeigen lassen')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option => {
        option
            .setName('gast')
            .setDescription('Nutzer mit der Gastrolle (optional)')
        return option;
    })

export async function execute (interaction) {
    const guild = interaction.guild.id;
    const user = interaction.options.getUser('gast', false);

    await db.get("SELECT * FROM guilds WHERE id = '" + interaction.guild.id + "'", async (error, col) => {
        if (error) console.log(error);
        if (!col || !col.role || !col.time) {
            await interaction.reply('Der Bot wurde auf diesem Server noch nicht eingerichtet. Bitte nutze /config um den Bot einzurichten')
            return;
        }
        let guest_role = await interaction.guild.roles.cache.get(col.role);


        if (user !== null) {
            let member = await interaction.guild.members.cache.get(user.id);
            if (!member) {
                await interaction.reply('Der Nutzer konnte nicht gefunden werden');
                return;
            }
            if (await member.roles.cache.some(role => role.id === guest_role.id)) {
                const maxTime = col.time;
                let now = new Date().getTime();
                let joined = member.joinedAt;
                let dif = maxTime - ((now - joined.getTime()) / 1000 / 60);

                await interaction.reply(`Der Nutzer <@${user.id}> hat noch ${Math.round(dif)} Minuten verbleibend`);

            } else {
                await interaction.reply(`Der Nutzer hat nicht die <@&${col.role}>-Rolle`);
            }
        } else {
            let response = ''
            await Promise.all(guest_role.members.map( async member => {
                const maxTime = col.time;
    
                let now = new Date().getTime();
    
                let joined = member.joinedAt;
    
                let dif = maxTime - ((now - joined.getTime()) / 1000 / 60);
                
                response += `\nDer Nutzer <@${member.id}> hat noch ${Math.round(dif)} Minuten verbleibend`;
            }));
            if (response === '') response = 'Zurzeit befinden sich keine Gäste auf diesem Server'
            await interaction.reply(response);
        }
    });
} 

export default {
    data, execute,
}