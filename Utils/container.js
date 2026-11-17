const { ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js')
const { Cut } = require('./embed')

/*
Components V2: buttons and menus INSIDE a box that looks like an embed (a "container").
V2(payload) takes what the commands already build ({ embeds, components: [rows], files, content... })
and returns the same message as containers: embed color = accent color, then author, title, text,
thumbnail, image, footer, and the rows at the bottom of the last box.
- Discord rule: once a message is sent with V2, every later edit of THAT message must use V2 too
  (update after a click, the final result, the edit that removes the buttons when the time is up...)
- A V2 message has no `content` / `embeds` and at most 4000 characters of text in total
  (the longest text is cut to fit)
*/
const MaxText = 4000

const Text = (content) => new TextDisplayBuilder().setContent(content)

// Embed (EmbedBuilder or its JSON) -> the texts of a box
function Parts(embed) {
    const e = (typeof embed?.toJSON === 'function') ? embed.toJSON() : (embed || {})
    const Time = (e.timestamp) ? `<t:${Math.floor(new Date(e.timestamp).getTime() / 1000)}:f>` : ''
    return {
        Color: e.color,
        Author: (e.author?.name) ? `-# ${e.author.name}` : '',
        Title: (e.title) ? `### ${e.title}` : '',
        Body: [e.description, ...(e.fields || []).map(f => `${f.name}\n${f.value}`)].filter(Boolean).join('\n\n'),
        Thumbnail: e.thumbnail?.url,
        Image: e.image?.url,
        Footer: [e.footer?.text, Time].filter(Boolean).join(' • ')
    }
}

function Box(p, Rows) {
    const box = new ContainerBuilder()
    if (p.Color != null) box.setAccentColor(p.Color)
    const Texts = [p.Author, p.Title, p.Body].filter(Boolean)
    if (!Texts.length && !p.Image) Texts.push('​')
    if (p.Thumbnail && Texts.length) {
        box.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(...Texts.map(Text))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(p.Thumbnail)))
    } else if (Texts.length) {
        box.addTextDisplayComponents(...Texts.map(Text))
    }
    if (p.Image) box.addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(p.Image)))
    if (p.Footer) box.addTextDisplayComponents(Text(`-# ${p.Footer}`))
    if (Rows.length) {
        box.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        box.addActionRowComponents(...Rows)
    }
    return box
}

// { embeds, components (rows), content, flags, files, ... } -> Components V2 message
function V2(payload = {}) {
    const { embeds = [], components = [], content, flags, ...rest } = payload
    const parts = embeds.map(Parts)

    //Too much text: the longest bodies are cut first
    let total = (content || '').length + parts.reduce((n, p) => n + p.Author.length + p.Title.length + p.Body.length + p.Footer.length + 3, 0)
    for (const p of [...parts].sort((a, b) => b.Body.length - a.Body.length)) {
        if (total <= MaxText) break
        const keep = Math.max(3, p.Body.length - (total - MaxText))
        total -= p.Body.length - keep
        p.Body = Cut(p.Body, keep)
    }

    const out = []
    if (content) out.push(Text(content))
    parts.forEach((p, i) => out.push(Box(p, (i === parts.length - 1) ? components : [])))
    if (!parts.length) out.push(...components)
    return { ...rest, components: out, flags: (Number(flags) || 0) | MessageFlags.IsComponentsV2 }
}

module.exports = { V2 }
