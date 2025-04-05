const { model, Schema } = require('mongoose')

const UserCards = new Schema({
    UserID: String,
    Cards: Array,
})

module.exports = model('UserCards', UserCards)