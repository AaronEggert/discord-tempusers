import dotenv from 'dotenv'

import { Client, Events, GatewayIntentBits, Collection, REST, Routes, PermissionsBitField } from 'discord.js';

import sqlite from 'sqlite3';
import fs from 'fs';
import path from 'path';

export const db = new sqlite.Database("guilds.sqlite", err => {if (err) {console.log(err)}});

db.run("CREATE TABLE IF NOT EXISTS guilds (id VARCHAR(255) PRIMARY KEY, role VARCHAR(255), time INTEGER)", e => {if (e) console.log(e)});
// db.exec("INSERT INTO guilds (id, role, time) VALUES ('873191708341440532', '1139317863140831314', 60)", (e, c) => console.log(e, c));
// db.get("SELECT * FROM guilds",(e, r) => console.log(e,r));


dotenv.config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences] });

client.commands = new Collection();

import configCommand from './commands/config.js'; 
import statusCommand from './commands/status.js'; 

try {
    client.commands.set(configCommand.data.name, configCommand);
    client.commands.set(statusCommand.data.name, statusCommand);
} catch (e) {
    console.log(e)
}

// console.log(client.commands)


const rest = new REST().setToken(process.env.BOT_TOKEN);

let commands = [];

client.commands.map(command => {
    commands.push(command.data);
})

const data = await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), {body: commands})

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
    setup();
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);
    try {
        command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
})

client.on(Events.GuildMemberAdd, c => {
    db.get("SELECT * FROM guilds WHERE id = '" + c.guild.id.toString() + "'", (error, col) => {
        if (error) console.log(error);
        let guest_role = c.guild.roles.cache.get(col.role);
        c.roles.add(guest_role);
    });
});

function setup() {
    setInterval(() => {
        client.guilds.cache.map(async guild => {
            db.get("SELECT * FROM guilds WHERE id = '" + guild.id + "'", async (error, col) => {
                if (error) console.log(error);
                if (col && col.role) {
                    let guest_role = guild.roles.cache.get(col.role);
                    guest_role.members.map( async member => {
                        const maxTime = col.time;
        
                        let now = new Date().getTime();
        
                        let joined = member.joinedAt;
        
                        let dif = (now - joined.getTime()) / 1000 / 60;
        
                        if (dif > maxTime) {
                            try {
                                if (member.permissions.has([PermissionsBitField.Flags.Administrator])) return;
                                else {
                                    await member.send('Du wurdest von dem Server ' + guild.name + ' automatisch gekickt, da du dem Server nur als Gast beigewohnt hast');
                                    member.kick('Du automatisch gekickt, da du Gast auf dem Server warst').catch(err => {});  
                                }
                            }
                            catch(e) {
                                // console.log(e);
                            }
                        }
                    })
                } else {
                    await guild.systemChannel.send("Der Bot ist auf diesem Server noch nicht eingerichtet, bitte nutze /config, um den Bot einzurichten")
                }
            });
        });
    }, 30000);
}


client.login(process.env.BOT_TOKEN);