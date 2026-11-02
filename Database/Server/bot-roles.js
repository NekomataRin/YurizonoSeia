const { model, Schema } = require('mongoose')

// Roles Seia made herself (Utils/config.js OwnerRoles): saved so she never makes the same role twice
const BotRole = new Schema({
    GuildID: { type: String, required: true },
    Name: { type: String, required: true },
    RoleID: { type: String, required: true },
    // false = moving it to its position failed, tried again on the next start
    Placed: { type: Boolean, default: false }
})
BotRole.index({ GuildID: 1, Name: 1 }, { unique: true })

module.exports = model('BotRole', BotRole)
