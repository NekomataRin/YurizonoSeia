const { model, Schema } = require('mongoose')

// /restrict: a member can't use Seia's commands on that server until `Until`
const Restriction = new Schema({
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    // When it ends (ms, Discord time), null = forever
    Until: { type: Number, default: null },
    Reason: String,
    ModID: String,
    Date: Number
})
Restriction.index({ GuildID: 1, UserID: 1 }, { unique: true })

module.exports = model('Restriction', Restriction)
