const { Schema, model } = require('mongoose')

// One document per checked user per server.
// Single / Average: the 100 most recent results (newest first)
const HowgayUser = new Schema({
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    Total: { type: Number, default: 0 },
    Special: { type: Number, default: 0 },
    Single: { type: [Number], default: undefined },
    Average: { type: [Number], default: undefined }
})
HowgayUser.index({ GuildID: 1, UserID: 1 }, { unique: true })

// One document per server.
// Normal: tier index -> count, Special: special key ('72_7' = 72.7%) -> count
// Keys come from Assets/Howgay, so a new easter egg needs no change here
const HowgayGuild = new Schema({
    GuildID: { type: String, required: true, unique: true },
    Normal: { type: Map, of: Number, default: undefined },
    Special: { type: Map, of: Number, default: undefined }
})

module.exports = {
    HowgayUser: model('HowgayUser', HowgayUser),
    HowgayGuild: model('HowgayGuild', HowgayGuild)
}
