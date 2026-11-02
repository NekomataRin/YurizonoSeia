const { model, Schema } = require('mongoose')

// Warnings of a member on one server (/warn, /warn-list, /warn-remove)
const Warns = new Schema({
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    // Oldest first. ModID = who warned, Date = when (ms, Discord time)
    Warns: [{ _id: false, Reason: String, ModID: String, Date: Number }]
})
Warns.index({ GuildID: 1, UserID: 1 }, { unique: true })

module.exports = model('Warns', Warns)
