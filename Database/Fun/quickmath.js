const { model, Schema } = require('mongoose')

// Best score of a user in one difficulty (GameKey = 'Easy', 'Asian'...)
const QuickMathDb = new Schema({
    UserID: String,
    GameKey: String,
    Level: Number,
    Score: Number,
    // When the best score was made (ms)
    Date: Number,
})

QuickMathDb.index({ UserID: 1, GameKey: 1 })
QuickMathDb.index({ GameKey: 1, Score: -1 })

module.exports = model('QuickMathDb', QuickMathDb)
