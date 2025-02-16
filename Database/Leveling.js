const { model, Schema } = require('mongoose')

const Leveling = new Schema({
    UserID: {
        type: String,
        required: true,
    },
    GuildID: {
        type: String,
        required: true
    },
    exp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    background: {
        type: String,
        default: 'none'
    },
    restrict: {
        type: String,
        required: false
    } 
})

module.exports = model('Level', Leveling)