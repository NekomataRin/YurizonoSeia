const mongoose = require('mongoose')
const wait = require('node:timers/promises').setTimeout
const Log = require('../Utils/logger')

mongoose.set('strictQuery', true)
// Indexes are built by Database/migrate.js after old data is cleaned up
mongoose.set('autoIndex', false)

// Connects to MongoDB, retrying every 10s (phone network can drop at boot).
// Returns false when MONGO_URL is missing.
async function ConnectDatabase() {
    const url = process.env.MONGO_URL
    if (!url) {
        Log.Warn('MONGO_URL is missing in .env, commands that need the database will not work!')
        return false
    }

    mongoose.connection.on('disconnected', () => Log.Warn('Database disconnected, waiting for it to come back...'))
    mongoose.connection.on('reconnected', () => Log.Info('Database reconnected!'))
    mongoose.connection.on('error', (err) => Log.Error('Database error:', err.message))

    for (let attempt = 1; ; attempt++) {
        try {
            await mongoose.connect(url, { serverSelectionTimeoutMS: 15000 })
            Log.Info('Database, Check!')
            return true
        } catch (err) {
            Log.Error(`Database connection failed (attempt ${attempt}): ${err.message}. Retrying in 10s...`)
            await wait(10000)
        }
    }
}

module.exports = { ConnectDatabase }
