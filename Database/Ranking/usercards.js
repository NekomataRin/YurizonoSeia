const { model, Schema } = require('mongoose')

// Rank card backgrounds a user has unlocked on one server (migration v5 gave the old shared lists to GUILD_ID)
const UserCards = new Schema({
    GuildID: String,
    UserID: String,
    Cards: Array,
})
UserCards.index({ GuildID: 1, UserID: 1 }, { unique: true })

module.exports = model('UserCards', UserCards)
