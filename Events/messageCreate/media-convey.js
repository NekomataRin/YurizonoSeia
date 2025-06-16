const { ChannelType } = require('discord.js')

// Emoji IDs
const EMOJI_ERROR = '<a:SeiaMuted:1336385867136241705>'
const EMOJI_STEP1 = '<:mikaeat:1254109782592327783>'
const EMOJI_STEP2 = '<a:NagisaPeek:1254453086295167026>'
const EMOJI_STEP3 = '<:seiaheh:1244128244664504392>'

// Regex definitions
const twitterRegex = /https?:\/\/(?:www\.|mobile\.)?x\.com\/[a-zA-Z0-9_]+\/status\/\d+(?:\?[^\s]*)?/gi
const facebookRegex = /https?:\/\/(?:www\.|m\.)?facebook\.com\/(?:([^\/\s]+)\/videos\/(\d+)|reel\/(\d+)|watch\/\?v=(\d+))(?:[/?&][^\s]*)?|https?:\/\/fb\.watch\/[\w-]+/gi
const facebookRedirectRegex = /https?:\/\/(?:www\.)?facebook\.com\/share\/[^/]+\/[\w-]+\/?/gi

module.exports = async (client, message) => {
  if (message.author.bot) return
  if (message.channel.type === ChannelType.DM) return
  if (message.guild.id !== process.env.GUILD_ID) return

  const content = message.content

  // Match links
  const twitterLinks = [...content.matchAll(twitterRegex)]
  const facebookLinks = [...content.matchAll(facebookRegex)]
  const redirectLinks = [...content.matchAll(facebookRedirectRegex)]
  const totalLinks = twitterLinks.length + facebookLinks.length + redirectLinks.length

  // Too many links?
  if (totalLinks > 1) {
    const errorMsg = await message.channel.send({
      content: `${EMOJI_ERROR} ${message.author} Sensei! You can only use one link either **Twitter** or **Facebook** link for this!`,
    })
    setTimeout(() => errorMsg.delete().catch(() => { }), 10000)
    await message.delete()
    return
  }

  // Facebook Redirect
  if (facebookRedirectRegex.test(content)) {
    try {
      await message.author.send(`🔗 Sensei! You sent a **Facebook redirect link**, please follow these steps below to get the full link!\n\n${EMOJI_STEP1} Open the link in your browser.\n${EMOJI_STEP2} Copy the full video or reel URL from the address bar.\n${EMOJI_STEP3} Repost that full link in the chat (NOT HERE) and I’ll convert it automatically for you!\n\n> Also: Don't forget this link you've sent here in case you wanted to copy again: ${redirectLinks[0]}`)
      const notice = await message.channel.send(`${EMOJI_ERROR} ${message.author} Sensei! This link is a redirect link, I cannot automatically convert it to the link you need, Please check your DMs for the instruction!`)
      setTimeout(() => notice.delete().catch(() => { }), 10000)
    } catch {
      const fallback = await message.channel.send(`${EMOJI_ERROR} Sensei! I cannot send to your DMs because it is closed! Please follow these steps below to get the full link!\n\n${EMOJI_STEP1} Open the link in your browser.\n${EMOJI_STEP2} Copy the full video or reel URL from the address bar.\n${EMOJI_STEP3} Repost that full link in the chat (NOT HERE) and I’ll convert it automatically for you!\n\n> Also: Don't forget this link you've sent here in case you wanted to copy again: ${redirectLinks[0]}`)
      setTimeout(() => fallback.delete().catch(() => { }), 30000)
    }
    await message.delete()
    return
  }

  // Twitter Conversion
  if (twitterLinks.length === 1) {
    const [match] = twitterLinks
    const converted = match[0].replace(/https?:\/\/(?:www\.|mobile\.)?x\.com/, 'https://fxtwitter.com')
    await message.channel.send({
      content: `${converted}\n\n> Requested by: \`${message.author.username}\``,
    })
    await message.delete()
    return
  }

  // Facebook Conversion with vanity
  if (facebookLinks.length === 1) {
    const [vanity, videoId1, reelId, watchId] = facebookLinks[0]
    let videoId = videoId1 || reelId || watchId

    if (!videoId) {
      await message.channel.send(`${EMOJI_ERROR} There is an invalid video ID, so I cannot do it for you!`)
      await message.delete()
      return
    } // safety fallback

    let converted = `https://facebed.com/watch/?v=${videoId}`
    if (vanity && vanity !== 'watch' && vanity !== 'reel') {
      converted += `&vanity=${vanity}`
    }

    await message.channel.send({
      content: `${converted}\n\n> Requested by: \`${message.author.username}\``,
    })
    await message.delete()
    return
  }
}
