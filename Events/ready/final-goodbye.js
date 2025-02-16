const { EmbedBuilder, AttachmentBuilder } = require('discord.js')


module.exports = async (client, message) => {
    const Channel = await client.channels.cache.get('1201818078711918602')
    await Channel.messages.delete('1273385424047444043')
    return process.exit()
}  