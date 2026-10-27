const Clock = require('../../Utils/clock')

// Every new message tells the time on Discord's clock (Utils/clock.js)
module.exports = async (client, message) => {
    Clock.Sync(message.createdTimestamp)
}
