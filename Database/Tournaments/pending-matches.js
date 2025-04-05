const { Schema, model } = require('mongoose')

let PendingMatches = new Schema({
    GuildID: String,
    Matches: Array,
})

module.exports = model('PendingMatches', PendingMatches)