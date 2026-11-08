const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const { SeiaEmbed, Cut } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { Changelogs } = require('../../Assets/Changelog')
const { version: Version } = require('../../package.json')

const Sparkle = '<a:LYG_Sparkle:1084084997398470747>'
const Invite = 'https://discord.gg/bQBQYU5vhb'
const MaxPage = 3800

// Command folders (Commands/<Category>) in menu order. A new folder shows up at the end by itself
const Categories = {
    Fun: { Emoji: '<:LYG_XD:1087375888276000788>', vi: 'Giải trí', en: 'Fun', Color: '#F6B3FF' },
    Misc: { Emoji: '<:LYG_Error:1087366990160740452>', vi: 'Linh tinh', en: 'Misc', Color: '#D3FFB3' },
    Server: { Emoji: '<a:ShirokoSparkle:1230151011205648504>', vi: 'Server & người dùng', en: 'Server & users', Color: '#F90000' },
    Ranking: { Emoji: '<:MikaSurprised:1416618240720900167>', vi: 'Xếp hạng', en: 'Ranking', Color: '#B3FFF6' },
    Utils: { Emoji: '<:momoishock:1230898036205682778>', vi: 'Tiện ích', en: 'Utils', Color: '#EFFFB3' },
    Moderation: { Emoji: '<a:ShirokoAlert:1230150424334438421>', vi: 'Quản lí (Mod)', en: 'Moderation (Mod)', Color: '#a1a7a7' }
}
const CategoryOf = (Folder) => Categories[Folder] || { Emoji: Sparkle, vi: Folder, en: Folder, Color: 'White' }

// Who can use a command = the label its description starts with. A page is split into these sections, in this order
const Labels = [
    { Text: '-Mod/Owner Only-', Group: 'modowner' },
    { Text: '-Mod Only-', Group: 'mod' },
    { Text: '-Owner Only-', Group: 'owner' },
    { Text: '-NekoRin\'s Only-', Group: 'owner', Note: 'NekoRin' }
]
const Groups = [
    { Key: 'all', vi: '👥 Mọi người', en: '👥 Everyone' },
    { Key: 'modowner', vi: '🛡️ Mod / Owner', en: '🛡️ Mod / Owner' },
    { Key: 'mod', vi: '🛡️ Mod', en: '🛡️ Mod' },
    { Key: 'owner', vi: '👑 Owner', en: '👑 Owner' }
]

// Clickable command (</name:id>) once Discord gave its ID (Handlers/commandHandler.js), plain bold text otherwise
const Mention = (command) => (command?.Id) ? `</${command.data.name}:${command.Id}>` : `**/${command?.data.name}**`

// Section + description (without its label) of a command, from the slash command itself (so /help is never outdated)
function Describe(command, vi) {
    const json = command.data.toJSON()
    const Label = Labels.find(l => json.description.startsWith(l.Text))
    const Raw = (vi && json.description_localizations?.vi) || json.description
    const Opts = (json.options || []).map(o => (o.required) ? `[${o.name}]` : `(${o.name})`).join(' ')
    return {
        Group: Label?.Group || 'all',
        Line: `${Mention(command)}${(Opts) ? ` \`${Opts}\`` : ''}${(Label?.Note) ? ` · *${Label.Note}*` : ''}\n└ ${(Label) ? Raw.replace(Label.Text, '').trim() : Raw}`
    }
}

const CommandsOf = (client, Folder) => client.commands.filter(c => c.Category === Folder).sort((a, b) => a.data.name.localeCompare(b.data.name))

// Pages of one category: "👥 Everyone" commands first, then the staff ones (more pages only when it's too long)
function CategoryPages(interaction, Folder, vi) {
    const Cat = CategoryOf(Folder)
    const List = CommandsOf(interaction.client, Folder).map(c => Describe(c, vi))
    const Head = `${Cat.Emoji} **${Cat[vi ? 'vi' : 'en']}** · ${List.length} ${vi ? 'lệnh' : 'commands'}`
    const Texts = []
    let Text = ''
    for (const G of Groups) {
        const Lines = List.filter(c => c.Group === G.Key).map(c => c.Line)
        if (!Lines.length) continue
        const GroupHead = `\n**${G[vi ? 'vi' : 'en']}**\n`
        Text += GroupHead
        for (const Line of Lines) {
            if (Head.length + Text.length + Line.length > MaxPage) {
                Texts.push(Text)
                Text = GroupHead
            }
            Text += `${Line}\n`
        }
    }
    Texts.push(Text)

    const Clickable = CommandsOf(interaction.client, Folder).some(c => c.Id)
    const Foot = `-# \`[ ]\` ${vi ? 'bắt buộc' : 'required'} · \`( )\` ${vi ? 'tuỳ chọn' : 'optional'}${(Clickable) ? ` · ${vi ? 'bấm vào tên lệnh để dùng' : 'click a command to use it'}` : ''}`
    return Texts.map((t, i) => SeiaEmbed(interaction, Cat.Color)
        .setTitle(`${Sparkle} **Yurizono Seia: ${vi ? 'Lệnh' : 'Commands'}** ${Sparkle}`)
        .setDescription(`${Head}${(Texts.length > 1) ? ` (${i + 1}/${Texts.length})` : ''}\n${t}\n${Foot}`))
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Seia\'s help: commands, changelog, credits and FAQ')
        .setDescriptionLocalizations({ vi: 'Trợ giúp của Seia: danh sách lệnh, changelog, credits và FAQ' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        const { commands } = interaction.client

        //Categories that have commands, + how many of them are for the staff
        const Folders = [...new Set([...Object.keys(Categories), ...commands.map(c => c.Category)])].filter(f => commands.some(c => c.Category === f))
        const Count = (Folder) => {
            const List = CommandsOf(interaction.client, Folder).map(c => Describe(c, vi))
            const Staff = List.filter(c => c.Group !== 'all').length
            return `${List.length} ${vi ? 'lệnh' : 'commands'}${(Staff) ? ` · ${Staff} ${vi ? 'cho staff' : 'for staff'}` : ''}`
        }

        const Home = SeiaEmbed(interaction)
            .setTitle(`${Sparkle} **Yurizono Seia: ${vi ? 'Trang chủ' : 'Home'}** ${Sparkle}`)
            .setDescription([
                vi ? '<:SeiaSip:1244890166116618340> Chào Sensei! Em là **Yurizono Seia**, cần gì cứ chọn trong menu bên dưới nhé~' : '<:SeiaSip:1244890166116618340> Hello Sensei! I\'m **Yurizono Seia**, pick what you need in the menu below~',
                `<:NoaNoted:1247028261847040050> **${vi ? 'Phiên bản' : 'Version'}:** v${Version} · **${vi ? 'Số lệnh' : 'Commands'}:** ${commands.size}`,
                '',
                `**${vi ? 'Nhóm lệnh' : 'Command groups'}**`,
                ...Folders.map(f => `> ${CategoryOf(f).Emoji} **${CategoryOf(f)[vi ? 'vi' : 'en']}** · ${Count(f)}`),
                '',
                `**${vi ? 'Thông tin khác' : 'More'}**`,
                '> <:KikyouLove:1415972689822093383> Changelog · <a:ShirokoChill:1230150488360615937> Credits · <a:ShirokoWot:1230151146249781298> FAQ',
                '',
                `-# ${vi ? 'Đổi ngôn ngữ trả lời của Seia' : 'Change Seia\'s language'}: ${Mention(commands.get('setup-language'))}`,
                `🔗 [[Support Server - Lazy Gang]](${Invite})`
            ].join('\n'))

        const Data = Changelogs[Version]
        const Log = (Data) ? ((!vi && Data.En) ? { ...Data, ...Data.En } : Data) : null
        const Changelog = SeiaEmbed(interaction, '#00FFFF')
            .setTitle(`${Sparkle} **Yurizono Seia: Changelog** ${Sparkle}`)
            .setDescription((Log)
                ? `${Log.Title}\n\n${Cut(Log.Description, 2000)}\n\n${Log.Sections.map(s => `> ${s.Name}`).join('\n')}\n\n-# ${vi ? 'Xem đầy đủ bằng' : 'See all of it with'} ${Mention(commands.get('changelog'))}`
                : `<:seiaconcerned:1244128341540208793> ${vi ? `Chưa có changelog cho v${Version}...` : `No changelog for v${Version} yet...`}`)

        const Credits = SeiaEmbed(interaction, '#00FFFF')
            .setTitle(`${Sparkle} **Yurizono Seia: Credits** ${Sparkle}`)
            .setDescription(`**\`\`\`\n${vi ? 'CẢM ƠN RẤT NHIỀU VÌ SỰ ĐÓNG GÓP CỦA NHỮNG NGƯỜI DƯỚI ĐÂY!!!' : 'THANK YOU SO MUCH FOR THE CONTRIBUTIONS OF THESE PEOPLE!!!'}\`\`\`**\n> <a:ShirokoChill:1230150488360615937> **• Contributor**\n- <@751225225047179324>\n- <@892054339072438303>\n\n> <:SerikaPyrox:1242841235228594338> **• Sponsor**\n- <@888738277044133899>\n- <@912514337602666526>\n- <a:LYG_LoadSlot:1087377575107645569>\n\n> <:KikyouLove:1415972689822093383> **• Special Thanks**\n- <@1176512171014893691>\n- <@790882475173609472>\n- <a:LYG_LoadSlot:1087377575107645569>`)

        const Q = '<:LYG_LaylaHmm:1086172125955633192> •'
        const FAQ = SeiaEmbed(interaction, 'Green')
            .setTitle(`${Sparkle} **Yurizono Seia: FAQ** ${Sparkle}`)
            .setDescription(vi
                ? `${Q} Người tạo bot là ai?\n- <@751225225047179324>\n\n${Q} Từ đâu mà lại làm ra con bot này?\n- Ý tưởng dựa trên Pre Release Venti Bot của <@809259609700302935>\n\n${Q} Tại sao phiên bản của Seia bắt đầu từ v1.3.0?\n- Vì Seia là bản kế nhiệm của Miosha (v1.0 → v1.2.x), nhiều lệnh cũ của Miosha đã được hồi sinh ở v1.4.1 đó!\n\n${Q} Đâu là câu lệnh dễ gây nghiện nhất?\n- \`/howgay\`, ngay cả chủ bot còn bị addicted mà <:LYG_XD:1087375888276000788>\n\n${Q} Có thể cho bot vào server khác không?\n- Đây là private bot nên link mời không khả dụng đâu nhá\n\n${Q} Vậy có thể lấy source code để tham khảo được chứ?\n- Được nhé, nó ở trên GitHub: [[NekomataRin/YurizonoSeia]](https://github.com/NekomataRin/YurizonoSeia) (bản Miosha cũ: [[KitsuneTohru/Miosha]](https://github.com/KitsuneTohru/Miosha))`
                : `${Q} Who made this bot?\n- <@751225225047179324>\n\n${Q} Where did the idea come from?\n- It's based on the Pre Release Venti Bot of <@809259609700302935>\n\n${Q} Why do Seia's versions start at v1.3.0?\n- Seia is the successor of Miosha (v1.0 → v1.2.x), and many of Miosha's old commands came back in v1.4.1!\n\n${Q} What is the most addictive command?\n- \`/howgay\`, even the owner got addicted <:LYG_XD:1087375888276000788>\n\n${Q} Can I invite the bot to another server?\n- It's a private bot, so there's no invite link, sorry\n\n${Q} Can I see the source code then?\n- Sure, it's on GitHub: [[NekomataRin/YurizonoSeia]](https://github.com/NekomataRin/YurizonoSeia) (old Miosha: [[KitsuneTohru/Miosha]](https://github.com/KitsuneTohru/Miosha))`)

        //Menu: Home, every category, Changelog, Credits, FAQ
        const Menu = (current) => new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId('help-menu')
            .setPlaceholder(vi ? 'Chọn phần bạn muốn xem' : 'Pick a section')
            .addOptions(
                { label: vi ? '| Trang chủ' : '| Home', description: vi ? 'Trang chủ của bảng trợ giúp' : 'The start page', emoji: '<a:LYG_404:1086172141998833684>', value: 'home', default: current === 'home' },
                ...Folders.map(f => ({ label: `| ${CategoryOf(f)[vi ? 'vi' : 'en']}`, description: Count(f), emoji: CategoryOf(f).Emoji, value: `cat:${f}`, default: current === `cat:${f}` })),
                { label: '| Changelog', description: vi ? 'Có gì mới ở phiên bản này' : 'What\'s new in this version', emoji: '<:KikyouLove:1415972689822093383>', value: 'clog', default: current === 'clog' },
                { label: '| Credits', description: vi ? 'Những người đã đóng góp cho bot' : 'The people who helped the bot', emoji: '<a:ShirokoChill:1230150488360615937>', value: 'credits', default: current === 'credits' },
                { label: '| FAQ', description: vi ? 'Mọi câu hỏi vui về con bot' : 'Fun questions about the bot', emoji: '<a:ShirokoWot:1230151146249781298>', value: 'faq', default: current === 'faq' }
            ))
        const PageRow = (i, total) => new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('help-prev').setEmoji('1086297531379613767').setStyle(ButtonStyle.Success).setDisabled(i === 0),
            new ButtonBuilder().setCustomId('help-page').setLabel(`| ${vi ? 'Trang' : 'Page'}: ${i + 1}/${total} |`).setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId('help-next').setEmoji('1086297678624854077').setStyle(ButtonStyle.Danger).setDisabled(i === total - 1)
        )

        const Sections = { home: Home, clog: Changelog, credits: Credits, faq: FAQ }
        const Pages = {}
        const PagesOf = (section) => (section.startsWith('cat:')) ? (Pages[section] ??= CategoryPages(interaction, section.slice(4), vi)) : [Sections[section]]
        const Render = (section, page) => {
            const List = PagesOf(section)
            return { embeds: [List[page]], components: (List.length > 1) ? [PageRow(page, List.length), Menu(section)] : [Menu(section)] }
        }

        let section = 'home', page = 0
        const message = await interaction.editReply(Render(section, page))
        const collector = message.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 5 * 60 * 1000 })
        collector.on('collect', async (i) => {
            if (i.customId === 'help-menu') {
                section = i.values[0]
                page = 0
            } else {
                page = (i.customId === 'help-next') ? Math.min(page + 1, PagesOf(section).length - 1) : Math.max(page - 1, 0)
            }
            await i.update(Render(section, page)).catch(() => {})
        })
        collector.on('end', () => interaction.editReply({ components: [] }).catch(() => {}))
    }
}
