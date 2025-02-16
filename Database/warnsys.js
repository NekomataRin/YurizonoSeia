const { model, Schema } = require('mongoose')

const WarnList = new Schema({
    UserID: String,
    Reason: Array,
})

module.exports = model('WarnList', WarnList)