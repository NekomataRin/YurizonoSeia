const { model, Schema } = require('mongoose')

const ServerData = new Schema({
    GuildID: String,
    MemberList: Array
})

module.exports = model('ServerData', ServerData)