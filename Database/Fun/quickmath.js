const { model, Schema } = require('mongoose')

// Best score of a user in one difficulty (GameKey = 'Easy', 'Asian'...) on one server
const QuickMathDb = new Schema({
    GuildID: String,
    UserID: String,
    GameKey: String,
    Level: Number,
    Score: Number,
    // When the best score was made (ms)
    Date: Number,
})

QuickMathDb.index({ GuildID: 1, UserID: 1, GameKey: 1 })
QuickMathDb.index({ GuildID: 1, GameKey: 1, Score: -1 })

module.exports = model('QuickMathDb', QuickMathDb)
