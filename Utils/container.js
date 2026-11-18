const { ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags } = require('discord.js')
const { Cut } = require('./embed')

/*
Components V2: buttons and menus INSIDE the box of an embed.
V2(payload) takes what the commands already build ({ embeds, components: [rows], files, content... })
and draws each embed the same way Discord draws a classic one, inside a container:
  color edge = embed color
  [small author name]
  **title**                       [thumbnail on the right, like an embed]
  description
  **field name** / field value
  [big image]
  [Seia icon] footer • time
  [buttons / menus of the message: only in the last box]
- Discord rule: once a message is sent with V2, every later edit of THAT message must use V2 too
  (update after a click, the final result, the edit that removes the buttons when the time is up...)
- A V2 message has no `content` / `embeds` and at most 4000 characters of text in total
  (the longest description is cut to fit)
- V2 can't draw small inline pictures: the author icon is left out, a small Seia emoji stands for the footer icon
*/
const MaxText = 4000
const FooterIcons = ['<:seiaheh:1244128244664504392>', '<:SeiaSip:1244890166116618340>', '<:SeiaPeek:1244890461592621147>', '<:seiaehem:1244128370669650060>', '<:SeiaSmug:1250768503431233616>']

const Text = (content) => new TextDisplayBuilder().setContent(content)
const Bold = (text) => (text.includes('**')) ? text : `**${text}**`

// Embed (EmbedBuilder or its JSON) -> the texts of a box
function Parts(embed) {
    const e = (typeof embed?.toJSON === 'function') ? embed.toJSON() : (embed || {})
    const Time = (e.timestamp) ? `<t:${Math.floor(new Date(e.timestamp).getTime() / 1000)}:f>` : ''
    const Footer = [e.footer?.text, Time].filter(Boolean).join(' • ')
    return {
        Color: e.color,
        Head: [(e.author?.name) ? `-# ${e.author.name}` : '', (e.title) ? Bold(e.title) : ''].filter(Boolean).join('\n'),
        Description: e.description || '',
        Fields: (e.fields || []).map(f => `**${f.name.replace(/\*\*/g, '')}**\n${f.value}`).join('\n\n'),
        Thumbnail: e.thumbnail?.url,
        Image: e.image?.url,
        Footer: (Footer) ? `-# ${FooterIcons[Math.floor(Math.random() * FooterIcons.length)]} ${Footer}` : ''
    }
}

function Box(p, Rows) {
    const box = new ContainerBuilder()
    if (p.Color != null) box.setAccentColor(p.Color)
    //Author + title + description in one block (tight lines, like the top of an embed)
    const Top = [p.Head, p.Description].filter(Boolean).join('\n')
    if (p.Thumbnail) {
        box.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(Text(Top || '​'))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(p.Thumbnail)))
    } else if (Top || (!p.Fields && !p.Image)) {
        box.addTextDisplayComponents(Text(Top || '​'))
    }
    if (p.Fields) box.addTextDisplayComponents(Text(p.Fields))
    if (p.Image) box.addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(p.Image)))
    if (p.Footer) box.addTextDisplayComponents(Text(p.Footer))
    if (Rows.length) box.addActionRowComponents(...Rows)
    return box
}

// { embeds, components (rows), content, flags, files, ... } -> Components V2 message
function V2(payload = {}) {
    const { embeds = [], components = [], content, flags, ...rest } = payload
    const parts = embeds.map(Parts)

    //Too much text: the longest descriptions are cut first
    let total = (content || '').length + parts.reduce((n, p) => n + p.Head.length + p.Description.length + p.Fields.length + p.Footer.length + 3, 0)
    for (const p of [...parts].sort((a, b) => b.Description.length - a.Description.length)) {
        if (total <= MaxText) break
        const keep = Math.max(3, p.Description.length - (total - MaxText))
        total -= p.Description.length - keep
        p.Description = Cut(p.Description, keep)
    }

    const out = []
    if (content) out.push(Text(content))
    parts.forEach((p, i) => out.push(Box(p, (i === parts.length - 1) ? components : [])))
    if (!parts.length) out.push(...components)
    return { ...rest, components: out, flags: (Number(flags) || 0) | MessageFlags.IsComponentsV2 }
}

module.exports = { V2 }
