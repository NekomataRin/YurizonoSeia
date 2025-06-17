const { ChannelType } = require('discord.js')

// Emoji IDs
const EMOJI_ERROR = '<a:SeiaMuted:1336385867136241705>'
const EMOJI_STEP1 = '<:mikaeat:1254109782592327783>'
const EMOJI_STEP2 = '<a:NagisaPeek:1254453086295167026>'
const EMOJI_STEP3 = '<:seiaheh:1244128244664504392>'

// Regex definitions
const twitterRegex = /https?:\/\/(?:www\.|mobile\.)?x\.com\/[a-zA-Z0-9_]+\/status\/\d+(?:\?[^\s]*)?/gi

// Redirect (unsupported types)
const facebookRedirectRegex = /https?:\/\/(?:www\.|web\.|m\.)?facebook\.com\/share\/(?:v|r)\/[\w-]+(?:\/text)?\/?/gi

// All Facebook links matcher
const facebookLinkRegex = /https?:\/\/(?:www\.|web\.|m\.)?facebook\.com\/[^\s]+|https?:\/\/fb\.watch\/[^\s]+/gi

module.exports = async (client, message) => {
  if (message.author.bot) return
  if (message.channel.type === ChannelType.DM) return
  if (message.guild.id !== process.env.GUILD_ID) return

  const content = message.content

  // Match links
  const twitterLinks = [...content.matchAll(twitterRegex)]
  const facebookLinks = [...content.matchAll(facebookLinkRegex)]
  const redirectLinks = [...content.matchAll(facebookRedirectRegex)]
  const totalLinks = twitterLinks.length + facebookLinks.length + redirectLinks.length

  if (totalLinks > 1) {
    const errorMsg = await message.channel.send({
      content: `${EMOJI_ERROR} ${message.author} Sensei! You can only use one link either **Twitter** or **Facebook** link for this!`,
    })
    setTimeout(() => errorMsg.delete().catch(() => {}), 10000)
    await message.delete()
    return
  }

  // --- Facebook redirect links (share/v/, share/r/) ---
  if (redirectLinks.length === 1) {
    try {
      await message.author.send(`🔗 Sensei! You sent a **Facebook redirect link**, please follow these steps below to get the full link!\n\n${EMOJI_STEP1} Open the link in your browser.\n${EMOJI_STEP2} Copy the full video or reel URL from the address bar.\n${EMOJI_STEP3} Repost that full link in the chat (NOT HERE) and I’ll convert it automatically for you!\n\n> Also: Don't forget this link you've sent here in case you wanted to copy again: ${redirectLinks[0]}`)

      const notice = await message.channel.send(`${EMOJI_ERROR} ${message.author} Sensei! This link is a redirect link, I cannot automatically convert it to the link you need. Please check your DMs for the instructions!`)
      setTimeout(() => notice.delete().catch(() => {}), 10000)
    } catch {
      const fallback = await message.channel.send(`${EMOJI_ERROR} Sensei! I cannot send to your DMs because they are closed! Please follow these steps below to get the full link!\n\n${EMOJI_STEP1} Open the link in your browser.\n${EMOJI_STEP2} Copy the full video or reel URL from the address bar.\n${EMOJI_STEP3} Repost that full link in the chat (NOT HERE) and I’ll convert it automatically for you!\n\n> Also: Don't forget this link you've sent here in case you wanted to copy again: ${redirectLinks[0]}`)
      setTimeout(() => fallback.delete().catch(() => {}), 30000)
    }
    await message.delete()
    return
  }

  // --- Twitter Link ---
  if (twitterLinks.length === 1) {
    const [match] = twitterLinks
    const converted = match[0].replace(/https?:\/\/(?:www\.|mobile\.)?x\.com/, 'https://fxtwitter.com')

    await message.channel.send({
      content: `${converted}\n\n> Requested by: \`${message.author.username}\``,
    })
    await message.delete()
    return
  }

  // --- Facebook formats (Facebed supported or video/reel/watch) ---
  if (facebookLinks.length === 1) {
    const [rawLink] = facebookLinks

    const converted = (() => {
      let m

      // /user/posts/:id
      m = rawLink[0].match(/facebook\.com\/user\/posts\/(\d+)/)
      if (m) return `https://facebed.com/user/posts/${m[1]}`

      // /share/p/:hash
      m = rawLink[0].match(/facebook\.com\/share\/p\/([\w-]+)/)
      if (m) return `https://facebed.com/share/p/${m[1]}`

      // /permalink.php?story_fbid=xxx&id=yyy
      m = rawLink[0].match(/facebook\.com\/permalink\.php\?story_fbid=(\d+)&id=(\d+)/)
      if (m) return `https://facebed.com/permalink.php?story_fbid=${m[1]}&id=${m[2]}`

      // /story.php?story_fbid=xxx&id=yyy
      m = rawLink[0].match(/facebook\.com\/story\.php\?story_fbid=(\d+)&id=(\d+)/)
      if (m) return `https://facebed.com/story.php?story_fbid=${m[1]}&id=${m[2]}`

      // /groups/:id/posts/:id
      m = rawLink[0].match(/facebook\.com\/groups\/(\d+)\/posts\/(\d+)/)
      if (m) return `https://facebed.com/groups/${m[1]}/posts/${m[2]}`

      // /watch/?v=xxx
      m = rawLink[0].match(/[?&]v=(\d+)/)
      if (m) return `https://facebed.com/watch/?v=${m[1]}`

      // /reel/:id
      m = rawLink[0].match(/facebook\.com\/reel\/(\d+)/)
      if (m) return `https://facebed.com/reel/${m[1]}`

      // /videos/:id
      m = rawLink[0].match(/facebook\.com\/[^\/]+\/videos\/(\d+)/)
      if (m) return `https://facebed.com/watch/?v=${m[1]}`

      // fb.watch
      m = rawLink[0].match(/fb\.watch\/([\w-]+)/)
      if (m) return `https://facebed.com/fb.watch/${m[1]}`

      return null
    })()

    if (converted) {
      await message.channel.send({
        content: `${converted}\n\n> Requested by: \`${message.author.username}\``,
      })
    } else {
      await message.channel.send(`${EMOJI_ERROR} Sensei! I couldn’t recognize this Facebook link. How do I convert those to the domain you needed?`)
    }

    await message.delete()
    return
  }
}
