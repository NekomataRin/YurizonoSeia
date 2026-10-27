const { BlockInvites } = require('../../Functions/Moderation/invite-guard')

// No invite links to other servers (main server only, some channels are allowed)
module.exports = async (client, message) => {
    await BlockInvites(client, message)
}
