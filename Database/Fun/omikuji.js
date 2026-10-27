const { Schema, model } = require('mongoose')

// Counts: tier -> count ('C-Tier', 'SS-Tier'...)
// Tiers with named cards also count each card: 'SS-Tier_0', 'SS-Tier_1'...
const OmikujiUser = new Schema({
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    Counts: { type: Map, of: Number, default: undefined }
})
OmikujiUser.index({ GuildID: 1, UserID: 1 }, { unique: true })

const OmikujiGuild = new Schema({
    GuildID: { type: String, required: true, unique: true },
    Counts: { type: Map, of: Number, default: undefined }
})

module.exports = {
    OmikujiUser: model('OmikujiUser', OmikujiUser),
    OmikujiGuild: model('OmikujiGuild', OmikujiGuild)
}
