const { model, Schema } = require('mongoose')

const Game2048Db = new Schema({
    guildID: String,
    userID: String,
    gameStats: {
        mode: String,
        scores: {
            current: Number,
            last: Number,
        },
        board: {
            current: [[Number]],
            last: [[Number]]
        },
        moveCount: Number,
        undoUsed: Boolean,
        lost: Boolean,
        TilesIndexes: {
            lastAddedTile: [Number],
            preNewTile: [Number]
        },
        lastSwapped: [[Number]],
        swapCount: Number,
        showOnce: Boolean,
        timestamp: String
    }
})

module.exports = model('Game2048', Game2048Db)