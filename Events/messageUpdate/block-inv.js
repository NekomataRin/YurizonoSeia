const { BlockInvites } = require('../../Functions/Moderation/invite-guard')

// Same check when someone edits an invite link into an old message
module.exports = async (client, oldMessage, newMessage) => {
    if (newMessage.partial) newMessage = await newMessage.fetch().catch(() => null)
    if (!newMessage || newMessage.content === oldMessage.content) return
    await BlockInvites(client, newMessage)
}
