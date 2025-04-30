const { Schema, model } = require('mongoose')

const DrxUsers = new Schema({
    DiscordID: String,
    UserID: Number
})

module.exports = model('DrxUser', DrxUsers)