const { SetupOwnerRoles } = require('../../Functions/Server/owner-role')
const Log = require('../../Utils/logger')

// Owner-only roles (Utils/config.js OwnerRoles): made the first time, checked on every start.
// Runs in the background, the bot doesn't wait for it
module.exports = async (client) => {
    SetupOwnerRoles(client).catch(err => Log.Error('Owner roles:', err.message))
}
