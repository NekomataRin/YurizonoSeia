const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const { SeiaEmbed, Cut } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { Changelogs } = require('../../Assets/Changelog')
const { version: Version } = require('../../package.json')

const Sparkle = '<a:LYG_Sparkle:1084084997398470747>'
const Invite = 'https://discord.gg/bQBQYU5vhb'
const MaxPage = 3800

// Command folders (Commands/<Category>) in page order. A new folder shows up at the end by itself
const Categories = {
    Fun: { Emoji: '<:LYG_XD:1087375888276000788>', vi: 'Giải trí', en: 'Fun', Color: '#F6B3FF' },
    Misc: { Emoji: '<:LYG_Error:1087366990160740452>', vi: 'Linh tinh', en: 'Misc', Color: '#D3FFB3' },
    Server: { Emoji: '<a:LYG_FubukiBorger:975937199486951464>', vi: 'Server & người dùng', en: 'Server & users', Color: '#F90000' },
    Ranking: { Emoji: '<:YuyukoWoah:1152872168439423050>', vi: 'Xếp hạng', en: 'Ranking', Color: '#B3FFF6' },
    Utils: { Emoji: '<:LYG_OkayuBOOM:1138231827140706304>', vi: 'Tiện ích', en: 'Utils', Color: '#EFFFB3' },
    Moderation: { Emoji: '<a:LYG_ReimuVibe:1133752889051975810>', vi: 'Quản lí (Mod)', en: 'Moderation (Mod)', Color: '#a1a7a7' }
}

// "/name [required] (optional)" + description, from the slash command itself (so /help is never outdated)
function CommandLine(command, vi) {
    const json = command.data.toJSON()
    const Desc = (vi && json.description_localizations?.vi) || json.description
    const Opts = (json.options || []).map(o => (o.required) ? `[${o.name}]` : `(${o.name})`).join(' ')
    return `> **• /${json.name}**${(Opts) ? ` \`${Opts}\`` : ''}\n${Desc}`
}

// One embed (or more when too long) per category
function CommandPages(interaction, vi) {
    const Pages = []
    const Folders = [...new Set([...Object.keys(Categories), ...interaction.client.commands.map(c => c.Category)])]
    for (const Folder of Folders) {
        const Cat = Categories[Folder] || { Emoji: Sparkle, vi: Folder, en: Folder, Color: 'White' }
        const Lines = interaction.client.commands.filter(c => c.Category === Folder).sort((a, b) => a.data.name.localeCompare(b.data.name)).map(c => CommandLine(c, vi))
        if (!Lines.length) continue
        const Head = `${Cat.Emoji} **${Cat[vi ? 'vi' : 'en']}** (${vi ? 'Số lệnh hiện có' : 'Commands'}: ${Lines.length})\n\n`
        let Text = Head
        for (const Line of Lines) {
            if (Text.length + Line.length > MaxPage) {
                Pages.push({ Cat, Text })
                Text = Head
            }
            Text += `${Line}\n\n`
        }
        Pages.push({ Cat, Text })
    }
    return Pages.map(({ Cat, Text }) => SeiaEmbed(interaction, Cat.Color)
        .setTitle(`${Sparkle} **Yurizono Seia: ${vi ? 'Lệnh' : 'Commands'}** ${Sparkle}`)
        .setDescription(`${Text.trim()}\n\n-# \`[ ]\` = ${vi ? 'bắt buộc' : 'required'}, \`( )\` = ${vi ? 'không bắt buộc' : 'optional'}`))
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

        const Home = SeiaEmbed(interaction)
            .setTitle(`${Sparkle} **Yurizono Seia: ${vi ? 'Trang chủ' : 'Home'}** ${Sparkle}`)
            .setDescription(`<:LYG_FubukiPing1:1084085915368050788> **${vi ? 'Phiên bản' : 'Version'}:** v${Version}\n<:SeiaSip:1244890166116618340> **${vi ? 'Số lệnh' : 'Commands'}:** ${interaction.client.commands.size}\n\n**${vi ? 'Lựa chọn các phần bên dưới để xem thông tin nhá!' : 'Pick a section below to see more!'}**\n> <:LYG_LaylaHmm:1086172125955633192> **${vi ? 'Lệnh' : 'Commands'}**\n> <a:LYG_OkayuLove:1087692048280334347> **Changelog**\n> <a:LYG_Fubuki_Chill:903085553145249822> **Credits**\n> <a:LYG_FubukiWhat:1084085930266218556> **FAQ**\n\n🔗 [[Support Server - Lazy Gang]](${Invite})`)

        const Data = Changelogs[Version]
        const Log = (Data) ? ((!vi && Data.En) ? { ...Data, ...Data.En } : Data) : null
        const Changelog = SeiaEmbed(interaction, '#00FFFF')
            .setTitle(`${Sparkle} **Yurizono Seia: Changelog** ${Sparkle}`)
            .setDescription((Log)
                ? `${Log.Title}\n\n${Cut(Log.Description, 2000)}\n\n${Log.Sections.map(s => `> ${s.Name}`).join('\n')}\n\n-# ${vi ? 'Xem đầy đủ bằng' : 'See all of it with'} \`/changelog\``
                : `<:seiaconcerned:1244128341540208793> ${vi ? `Chưa có changelog cho v${Version}...` : `No changelog for v${Version} yet...`}`)

        const Credits = SeiaEmbed(interaction, '#00FFFF')
            .setTitle(`${Sparkle} **Yurizono Seia: Credits** ${Sparkle}`)
            .setDescription(`**\`\`\`\n${vi ? 'CẢM ƠN RẤT NHIỀU VÌ SỰ ĐÓNG GÓP CỦA NHỮNG NGƯỜI DƯỚI ĐÂY!!!' : 'THANK YOU SO MUCH FOR THE CONTRIBUTIONS OF THESE PEOPLE!!!'}\`\`\`**\n> <a:LYG_Fubuki_Chill:903085553145249822> **• Contributor**\n- <@751225225047179324>\n- <@892054339072438303>\n\n> <:LYG_FubukiMoney:1096296266822062080> **• Sponsor**\n- <@888738277044133899>\n- <@912514337602666526>\n- <a:LYG_LoadSlot:1087377575107645569>\n\n> <a:LYG_OkayuLove:1087692048280334347> **• Special Thanks**\n- <@1176512171014893691>\n- <@790882475173609472>\n- <a:LYG_LoadSlot:1087377575107645569>`)

        const Q = '<:LYG_LaylaHmm:1086172125955633192> •'
        const FAQ = SeiaEmbed(interaction, 'Green')
            .setTitle(`${Sparkle} **Yurizono Seia: FAQ** ${Sparkle}`)
            .setDescription(vi
                ? `${Q} Người tạo bot là ai?\n- <@751225225047179324>\n\n${Q} Từ đâu mà lại làm ra con bot này?\n- Ý tưởng dựa trên Pre Release Venti Bot của <@809259609700302935>\n\n${Q} Tại sao phiên bản của Seia bắt đầu từ v1.3.0?\n- Vì Seia là bản kế nhiệm của Miosha (v1.0 → v1.2.x), nhiều lệnh cũ của Miosha đã được hồi sinh ở v1.4.1 đó!\n\n${Q} Đâu là câu lệnh dễ gây nghiện nhất?\n- \`/howgay\`, ngay cả chủ bot còn bị addicted mà <:LYG_XD:1087375888276000788>\n\n${Q} Có thể cho bot vào server khác không?\n- Đây là private bot nên link mời không khả dụng đâu nhá\n\n${Q} Vậy có thể lấy source code để tham khảo được chứ?\n- Được nhé, nó ở trên GitHub: [[NekomataRin/YurizonoSeia]](https://github.com/NekomataRin/YurizonoSeia) (bản Miosha cũ: [[KitsuneTohru/Miosha]](https://github.com/KitsuneTohru/Miosha))`
                : `${Q} Who made this bot?\n- <@751225225047179324>\n\n${Q} Where did the idea come from?\n- It's based on the Pre Release Venti Bot of <@809259609700302935>\n\n${Q} Why do Seia's versions start at v1.3.0?\n- Seia is the successor of Miosha (v1.0 → v1.2.x), and many of Miosha's old commands came back in v1.4.1!\n\n${Q} What is the most addictive command?\n- \`/howgay\`, even the owner got addicted <:LYG_XD:1087375888276000788>\n\n${Q} Can I invite the bot to another server?\n- It's a private bot, so there's no invite link, sorry\n\n${Q} Can I see the source code then?\n- Sure, it's on GitHub: [[NekomataRin/YurizonoSeia]](https://github.com/NekomataRin/YurizonoSeia) (old Miosha: [[KitsuneTohru/Miosha]](https://github.com/KitsuneTohru/Miosha))`)

        const Pages = CommandPages(interaction, vi)
        const Menu = (current) => new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId('help-menu')
            .setPlaceholder(vi ? 'Chọn phần bạn muốn xem' : 'Pick a section')
            .addOptions(
                { label: vi ? '| Trang chủ' : '| Home', description: vi ? 'Trang chủ của bảng trợ giúp' : 'The start page', emoji: '<a:LYG_404:1086172141998833684>', value: 'home', default: current === 'home' },
                { label: vi ? '| Lệnh' : '| Commands', description: vi ? 'Tất tần tật lệnh của bot' : 'Every command of the bot', emoji: '<:LYG_LaylaHmm:1086172125955633192>', value: 'cmd', default: current === 'cmd' },
                { label: '| Changelog', description: vi ? 'Có gì mới ở phiên bản này' : 'What\'s new in this version', emoji: '<a:LYG_OkayuLove:1087692048280334347>', value: 'clog', default: current === 'clog' },
                { label: '| Credits', description: vi ? 'Những người đã đóng góp cho bot' : 'The people who helped the bot', emoji: '<a:LYG_Fubuki_Chill:903085553145249822>', value: 'credits', default: current === 'credits' },
                { label: '| FAQ', description: vi ? 'Mọi câu hỏi vui về con bot' : 'Fun questions about the bot', emoji: '<a:LYG_FubukiWhat:1084085930266218556>', value: 'faq', default: current === 'faq' }
            ))
        const PageRow = (i) => new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('help-prev').setEmoji('1086297531379613767').setStyle(ButtonStyle.Success).setDisabled(i === 0),
            new ButtonBuilder().setCustomId('help-page').setLabel(`| ${vi ? 'Trang' : 'Page'}: ${i + 1}/${Pages.length} |`).setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId('help-next').setEmoji('1086297678624854077').setStyle(ButtonStyle.Danger).setDisabled(i === Pages.length - 1)
        )
        const Sections = { home: Home, clog: Changelog, credits: Credits, faq: FAQ }
        const Render = (section, page) => (section === 'cmd')
            ? { embeds: [Pages[page]], components: [PageRow(page), Menu('cmd')] }
            : { embeds: [Sections[section]], components: [Menu(section)] }

        let section = 'home', page = 0
        const message = await interaction.editReply(Render(section, page))
        const collector = message.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 5 * 60 * 1000 })
        collector.on('collect', async (i) => {
            if (i.customId === 'help-menu') {
                section = i.values[0]
                page = 0
            } else {
                page = (i.customId === 'help-next') ? Math.min(page + 1, Pages.length - 1) : Math.max(page - 1, 0)
            }
            await i.update(Render(section, page)).catch(() => {})
        })
        collector.on('end', () => interaction.editReply({ components: [] }).catch(() => {}))
    }
}
