const { Schema, model } = require('mongoose')

const OmikujiBonus = new Schema({
    GuildID: String,
    UserStats: Array
})

module.exports = model('OmikujiBonus', OmikujiBonus)