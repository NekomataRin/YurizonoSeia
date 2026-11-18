const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder } = require('discord.js')
const path = require('path')

const { SeiaEmbed, Cut } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Level = require('../../Database/Ranking/Leveling')
const { RankCards, FindCard, Collections } = require('../../Assets/RankCards')
const { UnlockedCards } = require('../../Functions/Ranking/cards')
const { V2 } = require('../../Utils/container')

// A select menu holds 25 options: bigger collections are cut into parts ("Blue Archive (1-25)", "Blue Archive (26-29)")
const PerMenu = 25
const Parts = Collections.flatMap(Col => {
    const Cards = RankCards.filter(c => c.Collection === Col)
    const n = Math.ceil(Cards.length / PerMenu)
    return Array.from({ length: n }, (_, i) => ({
        Id: `${Col}#${i}`,
        Col,
        Name: (n > 1) ? `${Col} (${i * PerMenu + 1}-${Math.min((i + 1) * PerMenu, Cards.length)})` : Col,
        Cards: Cards.slice(i * PerMenu, (i + 1) * PerMenu)
    }))
})
const PartOf = (Key) => Parts.find(p => p.Cards.some(c => c.Key === Key))

const Icon = { equipped: '<:SeiaSip:1244890166116618340>', owned: '<:seiaheh:1244128244664504392>', locked: '<:seiaehem:1244128370669650060>', default: '<:SeiaMuted:1244890584276008970>' }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('background-list')
        .setDescription('Browse every rank card, and see which ones you unlocked on this server')
        .setDescriptionLocalizations({ vi: 'Xem toàn bộ rank card, và những card bạn đã mở khoá ở server này' })
        .addStringOption(option =>
            option.setName('card')
                .setDescription('Open one card directly (key or name)')
                .setDescriptionLocalizations({ vi: 'Mở thẳng một card (key hoặc tên)' })
                .setAutocomplete(true)
                .setRequired(false)
        ),

    async autocomplete(interaction) {
        const q = interaction.options.getFocused().trim().toLowerCase()
        const List = RankCards.filter(c => c.Key.includes(q) || c.Title.toLowerCase().includes(q)).slice(0, 25)
        await interaction.respond(List.map(c => ({ name: Cut(`${c.Title} (${c.Key})`, 100), value: c.Key })))
    },

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        const L = vi
            ? { equipped: 'Đang dùng', owned: 'Đã nhận', locked: 'Chưa nhận', default: 'Có sẵn' }
            : { equipped: 'Equipped', owned: 'Obtained', locked: 'Not obtained', default: 'Default' }

        //What the user unlocked / equipped on this server
        const Unlocked = await UnlockedCards(interaction.guild.id, interaction.user.id)
        const Equipped = (await Level.findOne({ GuildID: interaction.guild.id, UserID: interaction.user.id }).select('-_id background').lean())?.background || 'none'
        const Status = (c) => (c.Key === FindCard(Equipped).Key) ? 'equipped' : (c.Key === 'none') ? 'default' : Unlocked.includes(c.Key) ? 'owned' : 'locked'
        const Mine = RankCards.filter(c => c.Key === 'none' || Unlocked.includes(c.Key))
        const Owned = (Cards) => Cards.filter(c => c.Key !== 'none' && Unlocked.includes(c.Key)).length
        const Total = RankCards.length - 1

        //Menu 1: overview, the user's cards, every collection (part)
        const CollectionMenu = (current) => new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId('bg-col')
            .setPlaceholder(vi ? 'Chọn bộ sưu tập' : 'Pick a collection')
            .addOptions([
                { label: vi ? '| Tổng quan' : '| Overview', description: vi ? 'Mọi bộ sưu tập + card đang dùng' : 'Every collection + your equipped card', emoji: '<:NoaNoted:1247028261847040050>', value: 'home', default: current === 'home' },
                { label: vi ? '| Card của Sensei' : '| Your cards', description: `${Mine.length} card`, emoji: Icon.owned, value: 'mine', default: current === 'mine' },
                ...Parts.map(p => ({ label: `| ${p.Name}`, description: `${p.Cards.length} card · ${L.owned.toLowerCase()} ${Owned(p.Cards)}`, emoji: p.Cards[0].Emoji, value: p.Id, default: current === p.Id }))
            ].slice(0, 25)))

        //Menu 2: the cards of one collection (part) or of the user
        const CardMenu = (Cards, current) => new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId('bg-card')
            .setPlaceholder(vi ? 'Chọn card để xem chi tiết' : 'Pick a card to see it')
            .addOptions(Cards.slice(0, 25).map(c => ({ label: Cut(c.Title, 100), description: `${c.Key} · ${L[Status(c)]}`, emoji: c.Emoji, value: c.Key, default: c.Key === current }))))

        const Base = (color, title, desc) => SeiaEmbed(interaction, color).setTitle(title).setDescription(desc)
        const Line = (c) => `${Icon[Status(c)]} ${c.Emoji} \`${c.Key}\` · ${c.Title}`

        function Home(note = '') {
            const Eq = FindCard(Equipped)
            const Cols = Collections.map(Col => {
                const Cards = RankCards.filter(c => c.Collection === Col)
                return `> ${Cards[0].Emoji} **${Col}** · ${Cards.length} card · ${L.owned.toLowerCase()} ${Owned(Cards)}`
            })
            const desc = (vi
                ? `${note}Bộ sưu tập rank card của ${interaction.user} (server này)\n> ${Icon.equipped} Đang dùng: ${Eq.Emoji} \`${Eq.Key}\` · ${Eq.Title}\n> ${Icon.owned} Đã nhận: **${Owned(RankCards)}/${Total}** card\n\n**Bộ sưu tập**\n${Cols.join('\n')}\n\n-# Chọn bộ sưu tập ở menu bên dưới, rồi chọn card để xem chi tiết`
                : `${note}Rank cards of ${interaction.user} (this server)\n> ${Icon.equipped} Equipped: ${Eq.Emoji} \`${Eq.Key}\` · ${Eq.Title}\n> ${Icon.owned} Obtained: **${Owned(RankCards)}/${Total}** cards\n\n**Collections**\n${Cols.join('\n')}\n\n-# Pick a collection in the menu below, then a card to see it`)
            return { embeds: [Base(Eq.Color, `${Eq.Emoji} **Rank Cards** - ${interaction.guild.name}`, desc)], components: [CollectionMenu('home')], files: [], attachments: [] }
        }

        function List(view) {
            const Part = Parts.find(p => p.Id === view)
            const Cards = Part ? Part.Cards : Mine
            const Title = Part ? `${Cards[0].Emoji} **${Part.Name}** · ${Cards.length} card` : `${Icon.owned} **${vi ? 'Card của Sensei' : 'Your cards'}** · ${Cards.length} card`
            const desc = `${Cards.map(Line).join('\n')}${(Cards.length > 25) ? `\n-# ${vi ? 'Menu chỉ hiện 25 card đầu' : 'The menu shows the first 25 cards'}` : ''}\n\n-# ${vi ? 'Chọn card ở menu bên dưới để xem chi tiết' : 'Pick a card in the menu below to see it'}`
            return { embeds: [Base(Cards[0].Color, Title, Cut(desc, 4096))], components: [CollectionMenu(view), CardMenu(Cards, null)], files: [], attachments: [] }
        }

        function Card(Key, view) {
            const c = FindCard(Key)
            const s = Status(c)
            const Context = Parts.find(p => p.Id === view)?.Cards.some(x => x.Key === c.Key) ? view : (view === 'mine' && Mine.some(x => x.Key === c.Key)) ? 'mine' : (PartOf(c.Key)?.Id || 'mine')
            const Cards = Parts.find(p => p.Id === Context)?.Cards || Mine
            const Hint = (s === 'locked')
                ? (vi ? '\n-# Chưa có card này? Card do Mod / Owner trao bằng `/background-manage`' : '\n-# Don\'t have it? Mods / owners give cards with `/background-manage`')
                : (s === 'owned') ? (vi ? `\n-# Dùng card này: \`/background-set keyword:${c.Key}\`` : `\n-# Use it: \`/background-set keyword:${c.Key}\``) : ''
            const desc = vi
                ? `> Người dùng: ${interaction.user}\n> ${Icon[s]} Trạng thái: \`${L[s]}\`\n> Tiêu đề: \`${c.Title}\`\n> Bộ sưu tập: \`${c.Collection || 'Mặc định'}\`${Hint}`
                : `> User: ${interaction.user}\n> ${Icon[s]} Status: \`${L[s]}\`\n> Title: \`${c.Title}\`\n> Collection: \`${c.Collection || 'Default'}\`${Hint}`
            return {
                embeds: [Base(c.Color, `[${c.Emoji}] **Card Key:** \`${c.Key}\``, desc).setImage(`attachment://${path.basename(c.Background)}`)],
                components: [CollectionMenu(Context), CardMenu(Cards, c.Key)],
                files: [new AttachmentBuilder(c.Background)],
                attachments: []
            }
        }

        //Start: the card asked with the option, or the overview
        const Asked = interaction.options.getString('card')?.trim().toLowerCase()
        let view = 'home'
        let first
        if (Asked && RankCards.some(c => c.Key === Asked)) {
            first = Card(Asked, null)
            view = PartOf(Asked)?.Id || 'mine'
        } else {
            first = Home((Asked) ? `<:seiaconcerned:1244128341540208793> ${vi ? `Không có card \`${Cut(Asked, 30)}\`, Sensei xem danh sách bên dưới nhé` : `There's no \`${Cut(Asked, 30)}\` card, have a look below`}\n\n` : '')
        }
        //Components V2: both menus sit inside the box, under the card
        let last = first
        const message = await interaction.editReply(V2(first))

        const collector = message.createMessageComponentCollector({ filter: a => a.user.id === interaction.user.id, time: 300000 })
        collector.on('collect', async (a) => {
            const value = a.values?.[0]
            let payload
            if (a.customId === 'bg-col') {
                view = value
                payload = (value === 'home') ? Home() : List(value)
            } else if (a.customId === 'bg-card') {
                payload = Card(value, view)
            }
            if (!payload) return
            last = payload
            await a.update(V2(payload)).catch(() => {})
        })
        //Time is up: the last page stays, without the menus
        collector.on('end', () => interaction.editReply(V2({ ...last, components: [] })).catch(() => {}))
    }
}
