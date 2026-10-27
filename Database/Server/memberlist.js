const { model, Schema } = require('mongoose')

const ServerData = new Schema({
    GuildID: String,
    MemberList: Array
})

// One document per server, MemberList = [{ UserId, joined }] of everyone who ever joined
ServerData.index({ GuildID: 1 })

module.exports = model('ServerData', ServerData)
