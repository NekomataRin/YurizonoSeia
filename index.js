const path = require('node:path')
const wait = require('node:timers/promises').setTimeout
require('dotenv').config({ path: path.join(__dirname, '.env') })

const { Client, GatewayIntentBits, Partials } = require('discord.js')
const mongoose = require('mongoose')
const Log = require('./Utils/logger')
const { ConnectDatabase } = require('./Database/connect')
const { RunMigrations } = require('./Database/migrate')
const { LoadCommands, RegisterCommands } = require('./Handlers/commandHandler')
const eventHandler = require('./Handlers/eventHandler')

// Keep the bot alive no matter what (errors are logged instead of killing the process)
process.on('unhandledRejection', (err) => Log.Error('Unhandled Rejection:', err))
process.on('uncaughtException', (err) => Log.Error('Uncaught Exception:', err))

if (!process.env.TOKEN || !process.env.CLIENT_ID) {
    Log.Error('TOKEN and CLIENT_ID must be set in the .env file!')
    process.exit(1)
}

// Only what the bot uses (less gateway traffic = less battery/RAM on the phone)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User]
})

client.on('error', (err) => Log.Error('Client Error:', err))
client.on('shardError', (err) => Log.Error('Websocket Error:', err.message))

LoadCommands(client)
eventHandler(client)

// No internet at boot (phone) -> try again every 15s. A wrong token stops the bot.
async function Login() {
    for (let attempt = 1; ; attempt++) {
        try {
            return await client.login(process.env.TOKEN)
        } catch (err) {
            if (['TokenInvalid', 'DisallowedIntents'].includes(err.code)) throw err
            Log.Error(`Login failed (attempt ${attempt}): ${err.message}. Retrying in 15s...`)
            await wait(15000)
        }
    }
}

;(async () => {
    await ConnectDatabase()
    await RunMigrations()
    await RegisterCommands(client)
    await Login()
})().catch((err) => {
    Log.Error('Cannot start the bot:', err)
    process.exit(1)
})

// Ctrl + C (or Termux closing) -> log out cleanly
async function Shutdown(signal) {
    Log.Info(`${signal} received, shutting down...`)
    await client.destroy()
    await mongoose.disconnect().catch(() => {})
    process.exit(0)
}
process.on('SIGINT', () => Shutdown('SIGINT'))
process.on('SIGTERM', () => Shutdown('SIGTERM'))
