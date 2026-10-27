const { MarkDeleted } = require('../../Utils/bot-deleted')

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
const facebookLinkRegex = /https?:\/\/(?:www\.|web\.|m\.)?facebook\.com\/(?!(?:share\/[vr]\/))(?:(?:[^\/\s]+\/videos\/(\d+))|reel\/(\d+)|watch\/\?v=(\d+)|fb\.watch\/[\w-]+|[^\/]+\/posts\/[\w-]+|permalink\.php\?story_fbid=\d+&id=\d+|story\.php\?story_fbid=\d+&id=\d+|groups\/\d+\/posts\/[\w-]+)(?:[/?&][^\s]*)?/gi

// Facebook link -> facebed.com link (null = unknown format)
function ConvertFacebook(link) {
    let m

    // /user/posts/:id
    m = link.match(/facebook\.com\/user\/posts\/(\d+)/)
    if (m) return `https://facebed.com/user/posts/${m[1]}`

    // /share/p/:hash
    m = link.match(/facebook\.com\/share\/p\/([\w-]+)/)
    if (m) return `https://facebed.com/share/p/${m[1]}`

    // /permalink.php?story_fbid=xxx&id=yyy
    m = link.match(/facebook\.com\/permalink\.php\?story_fbid=(\d+)&id=(\d+)/)
    if (m) return `https://facebed.com/permalink.php?story_fbid=${m[1]}&id=${m[2]}`

    // /story.php?story_fbid=xxx&id=yyy
    m = link.match(/facebook\.com\/story\.php\?story_fbid=(\d+)&id=(\d+)/)
    if (m) return `https://facebed.com/story.php?story_fbid=${m[1]}&id=${m[2]}`

    // /groups/:id/posts/:id
    m = link.match(/facebook\.com\/groups\/(\d+)\/posts\/(\d+)/)
    if (m) return `https://facebed.com/groups/${m[1]}/posts/${m[2]}`

    // /watch/?v=xxx
    m = link.match(/[?&]v=(\d+)/)
    if (m) return `https://facebed.com/watch/?v=${m[1]}`

    // /reel/:id
    m = link.match(/facebook\.com\/reel\/(\d+)/)
    if (m) return `https://facebed.com/reel/${m[1]}`

    // /videos/:id
    m = link.match(/facebook\.com\/[^\/]+\/videos\/(\d+)/)
    if (m) return `https://facebed.com/watch/?v=${m[1]}`

    // fb.watch
    m = link.match(/fb\.watch\/([\w-]+)/)
    if (m) return `https://facebed.com/fb.watch/${m[1]}`

    return null
}

/*
Converted message:
<converted link>
> Requested by: `user`
> Context: <the message without the link>   (only when there is other text)
*/
function BuildMessage(converted, message, link) {
    let text = `${converted}\n> Requested by: \`${message.author.username}\``

    const context = message.content
        .replace(link, '')
        .replace(/<\s*>/g, '')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .trim()
    if (context) {
        const room = 2000 - text.length - 20
        const cut = (context.length > room) ? context.slice(0, room - 3) + '...' : context
        text += `\n> Context: ${cut.split('\n').join('\n> ')}`
    }
    return text
}

async function SendConverted(message, converted, link) {
    await message.channel.send({
        content: BuildMessage(converted, message, link),
        //Never ping anyone that was mentioned in the context
        allowedMentions: { parse: [] }
    })
    MarkDeleted(message.id)
    await message.delete().catch(() => {})
}

module.exports = async (client, message) => {
    if (message.author.bot || !message.inGuild()) return

    const content = message.content || ''

    // Match links
    const twitterLinks = [...content.matchAll(twitterRegex)]
    const facebookLinks = [...content.matchAll(facebookLinkRegex)]
    const redirectLinks = [...content.matchAll(facebookRedirectRegex)]
    const totalLinks = twitterLinks.length + facebookLinks.length + redirectLinks.length
    if (totalLinks === 0) return

    if (totalLinks > 1) {
        const errorMsg = await message.channel.send({
            content: `${EMOJI_ERROR} ${message.author} Sensei! You can only use one link either **Twitter** or **Facebook** link for this!`,
        })
        setTimeout(() => errorMsg.delete().catch(() => {}), 10000)
        await message.delete().catch(() => {})
        return
    }

    // --- Facebook redirect links (share/v/, share/r/) ---
    if (redirectLinks.length === 1) {
        const Steps = `${EMOJI_STEP1} Open the link in your browser.\n${EMOJI_STEP2} Copy the full video or reel URL from the address bar.\n${EMOJI_STEP3} Repost that full link in the chat (NOT HERE) and I’ll convert it automatically for you!\n\n> Also: Don't forget this link you've sent here in case you wanted to copy again: ${redirectLinks[0][0]}`
        try {
            await message.author.send(`🔗 Sensei! You sent a **Facebook redirect link**, please follow these steps below to get the full link!\n\n${Steps}`)

            const notice = await message.channel.send(`${EMOJI_ERROR} ${message.author} Sensei! This link is a redirect link, I cannot automatically convert it to the link you need. Please check your DMs for the instructions!`)
            setTimeout(() => notice.delete().catch(() => {}), 10000)
        } catch {
            const fallback = await message.channel.send(`${EMOJI_ERROR} Sensei! I cannot send to your DMs because they are closed! Please follow these steps below to get the full link!\n\n${Steps}`)
            setTimeout(() => fallback.delete().catch(() => {}), 30000)
        }
        await message.delete().catch(() => {})
        return
    }

    // --- Twitter Link ---
    if (twitterLinks.length === 1) {
        const link = twitterLinks[0][0]
        const converted = link.replace(/https?:\/\/(?:www\.|mobile\.)?x\.com/, 'https://fixupx.com')
        return SendConverted(message, converted, link)
    }

    // --- Facebook formats (Facebed supported or video/reel/watch) ---
    if (facebookLinks.length === 1) {
        const link = facebookLinks[0][0]
        const converted = ConvertFacebook(link)

        if (converted) return SendConverted(message, converted, link)

        await message.channel.send(`${EMOJI_ERROR} Sensei! I couldn’t recognize this Facebook link. How do I convert those to the domain you needed?`)
        await message.delete().catch(() => {})
    }
}
