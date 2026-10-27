const wait = require('node:timers/promises').setTimeout
const Config = require('../../Utils/config')
const Log = require('../../Utils/logger')

// Gallery channel: exactly 1 png/jpg per message, Seia adds the vote reactions
module.exports = async (client, message) => {
    if (message.channel.id !== Config.Channels.Gallery) return
    if (message.author.bot) return
    if (message.guild?.id !== process.env.GUILD_ID) return

    // Warning that deletes itself after 5s
    const Warn = async (text) => {
        await message.delete().catch(() => {})
        await wait(500)
        const msg = await message.channel.send(`<a:SeiaMuted:1336385867136241705> ${message.author} ${text}`)
        setTimeout(() => msg.delete().catch(() => {}), 5000)
    }

    if (message.attachments.size === 0) {
        return Warn(`Sensei! If you wanted to chat, please head to <#${Config.Channels.GalleryChat}>!`)
    }
    if (message.attachments.size > 1) {
        return Warn(`Sensei! You can only use **1 Image** per message! Please separate those for each message for me!`)
    }

    const type = message.attachments.first().contentType
    Log.Debug(`Gallery - MessageID: ${message.id} | Type: ${type}`)
    if (!['image/png', 'image/jpeg'].includes(type)) {
        return Warn(`Oi! Wrong File's Extention, Sensei! I only accept those \`png/jpg/jpeg\` only!`)
    }

    await wait(250)
    await message.react(Config.Emojis.GalleryUpvote)
    await message.react(Config.Emojis.GalleryDownvote)
}
