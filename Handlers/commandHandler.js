const path = require('path')
const { Collection, REST, Routes, InteractionContextType } = require('discord.js')
const getAllFiles = require('../Utils/getAllFiles')
const Log = require('../Utils/logger')

// Commands/<Category>/<name>.js -> { data, execute, autocomplete? }
function LoadCommands(client) {
    client.commands = new Collection()

    for (const folder of getAllFiles(path.join(__dirname, '..', 'Commands'), true)) {
        for (const file of getAllFiles(folder).filter(file => file.endsWith('.js'))) {
            const command = require(file)
            if (!command?.data || typeof command.execute !== 'function') {
                Log.Warn(`Skipped ${path.basename(folder)}/${path.basename(file)}: missing "data" or "execute"`)
                continue
            }
            // Every command needs a server, so hide them in DMs
            command.data.setContexts?.(InteractionContextType.Guild)
            client.commands.set(command.data.name, command)
        }
    }
    Log.Info(`Loaded ${client.commands.size} Commands`)
}

// Sends the command list to Discord (global commands, can take a while to show up)
async function RegisterCommands(client) {
    try {
        const body = client.commands.map(command => command.data.toJSON())
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)
        const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body })
        Log.Info(`Successfully Registered ${data.length} Commands`)
    } catch (err) {
        Log.Error('Cannot register slash commands:', err)
    }
}

module.exports = { LoadCommands, RegisterCommands }
