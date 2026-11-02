const { GiveOwner } = require('../../Functions/Server/owner-role')

// A bot owner joined: they get the owner-only role of this server
module.exports = async (client, member) => {
    await GiveOwner(member)
}
