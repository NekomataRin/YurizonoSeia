const { model, Schema } = require('mongoose')

// Rank card backgrounds a user has unlocked (shared by every server)
const UserCards = new Schema({
    UserID: { type: String, index: true },
    Cards: Array,
})

module.exports = model('UserCards', UserCards)
