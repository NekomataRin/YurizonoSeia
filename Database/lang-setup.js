const { model, Schema } = require('mongoose')

const Langugage = new Schema({
    UserID: { type: String, index: true },
    Lang: String,
})

module.exports = model("Language", Langugage)
