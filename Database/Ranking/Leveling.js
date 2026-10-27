const { model, Schema } = require('mongoose')

const Leveling = new Schema({
    UserID: {
        type: String,
        required: true,
    },
    GuildID: {
        type: String,
        required: true
    },
    exp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    background: {
        type: String,
        default: 'none'
    },
    restrict: {
        type: String,
        default: 'Code-0'
    }
})

// One document per user per server + fast leaderboard sorting
Leveling.index({ GuildID: 1, UserID: 1 }, { unique: true })
Leveling.index({ GuildID: 1, total: -1 })

module.exports = model('Level', Leveling)
