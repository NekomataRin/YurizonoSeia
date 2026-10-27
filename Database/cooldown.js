const { model, Schema } = require('mongoose')

// One document per user, each field = the time (ms) that command can be used again
let cdSchema = new Schema({
    //User_ID Stored
    UserID: { type: String, index: true },
    //Commands Related
    //Fun
    HowGay: String,
    QuickMath: String,
    Omikuji: String,
    Game2048: String,
    MinigameTop: String,
    //Misc
    CheckAlive: String,
    //Ranking
    Rank: String,
    Top: String,
    //Server
    Avatar: String,
    ServerInfo: String,
    UserInfo: String,
})

module.exports = model('Cooldown', cdSchema)
