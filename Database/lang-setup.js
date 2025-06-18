const { model, Schema } = require('mongoose')

const Langugage = new Schema({
    UserID: String,
    Lang: String,
})

module.exports = model("Language", Langugage)