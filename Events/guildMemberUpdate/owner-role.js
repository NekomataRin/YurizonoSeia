const { CheckMember } = require('../../Functions/Server/owner-role')

// Someone who isn't a bot owner got an owner-only role -> Seia takes it back right away
module.exports = async (client, oldMember, newMember) => {
    await CheckMember(newMember)
}
