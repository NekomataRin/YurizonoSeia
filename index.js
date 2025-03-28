const { Client, GatewayIntentBits, Collection } = require('discord.js');

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const eventHandler = require('./Handlers/eventHandler')
const chalk = require('chalk')

const dotenv = require('dotenv')
dotenv.config()

const token = process.env.TOKEN;
const clientID = process.env.CLIENT_ID;
const guildID = process.env.GUILD_ID

const commands = [];

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => {
        return GatewayIntentBits[a]
    }),
});

eventHandler(client)

//Command Handler
const commandFolers = fs.readdirSync('./Commands')
for (const folder of commandFolers) {
    const commandFiles = fs.readdirSync(`./Commands/${folder}`).filter((file) => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command = require(`./Commands/${folder}/${file}`)
        commands.push(command.data.toJSON())
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(chalk.blue('[LOG]') + ` Refreshing ${commands.length} Commands`);
        let data
        data = await rest.put(
            Routes.applicationGuildCommands(clientID, guildID),
            { body: commands },
            //{ body : []},
        );
        console.log(chalk.blue('[LOG]') + ` Successfully Created ${data.length} Commands`)
    } catch (error) {
        console.error(error);
    }
})();

/*rest.put(Routes.applicationCommand(clientID, guildID), {body: []})
    .then(() => console.log('Successfully Reseted All Commands'))
    .catch(console.error);
rest.put(Routes.applicationCommand(clientID), {body: []})
    .then(() => console.log('Successfully Reseted All Commands'))
    .catch(console.error);*/

client.commands = new Collection();
const commandFolders = fs.readdirSync('./Commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./Commands/${folder}`).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command = require(`./Commands/${folder}/${file}`);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    };
}

//Event Handler
const eventsPath = path.join(__dirname, 'Events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
};

client.login(token);

