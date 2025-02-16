const { model, Schema } = require('mongoose')

let NWordList = new Schema({
    UserID: String,
    NWords: Number,
})

module.exports = model('NWordsList', NWordList)
