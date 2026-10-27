const { model, Schema } = require('mongoose')

// Best game of a user in one mode on one server (for /game-2048-top)
const Game2048Best = new Schema({
    guildID: { type: String, required: true },
    userID: { type: String, required: true },
    mode: { type: String, required: true },
    score: { type: Number, default: 0 },
    // Biggest tile of that game, its moves, and when it was played (ms)
    tile: { type: Number, default: 0 },
    moves: { type: Number, default: 0 },
    date: Number
})

Game2048Best.index({ guildID: 1, userID: 1, mode: 1 }, { unique: true })
Game2048Best.index({ guildID: 1, mode: 1, score: -1 })

module.exports = model('Game2048Best', Game2048Best)
