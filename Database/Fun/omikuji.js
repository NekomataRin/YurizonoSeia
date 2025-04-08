const { Schema, model } = require('mongoose')

const Omikuji = new Schema({
    GuildId: Number,
    UserRecords: Array,
    TypeRecords: Array
})


module.exports = model('Omikuji', Omikuji)