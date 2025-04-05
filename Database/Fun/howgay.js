const { Schema, model } = require('mongoose')

const HowgayList = new Schema({
    GuildId: Number,
    UserRecords: Array,
    TypeRecords: Array
})


module.exports = model('HowgayList', HowgayList)