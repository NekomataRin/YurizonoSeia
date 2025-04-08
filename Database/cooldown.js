const { model, Schema } = require('mongoose')

let cdSchema = new Schema({
    //User_ID Stored
    UserID: String,
    //Commands Related
    //Fun
    HowGay: String,
    QuickMath: String,
    Omikuji: String,
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