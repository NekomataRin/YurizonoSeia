const { model, Schema } = require('mongoose')

// /mod-afk: staff members who are away on a server (one document = AFK). Pinging them makes Seia remind the pinger
const ModAfk = new Schema({
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    // Since when (ms, Discord time)
    Since: Number
})
ModAfk.index({ GuildID: 1, UserID: 1 }, { unique: true })

module.exports = model('ModAfk', ModAfk)
