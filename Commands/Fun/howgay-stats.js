const { SlashCommandBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const { SeiaEmbed, AvatarOf } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { SendPages } = require('../../Utils/pages')
const HowgayConfig = require('../../Assets/Howgay/config')
const SpecialCases = require('../../Assets/Howgay/special-cases')
const { SpecialDbKey } = require('../../Functions/Fun/howgay')
const { HowgayUser, HowgayGuild } = require('../../Database/Fun/howgay')

const Percent = (list, fn) => (list?.length) ? `${Number(fn(...list)).toFixed(4)}` : '--'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('howgay-stats')
        .setDescription('See the stats of /howgay on User or Server')
        .setDescriptionLocalizations({ vi: "Xem thống kê số lần sử dụng lệnh /howgay lên người dùng hoặc server" }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        const UserTitle = vi ? `🏳️‍🌈 Thống Kê Chỉ Số Gay Của Người Dùng` : `🏳️‍🌈 Checking Gayness Stats Of A User`
        const ServerTitle = vi ? `🏳️‍🌈 Thống Kê Chỉ Số Gay Của Cả Server` : `🏳️‍🌈 Checking Gayness Stats Of Server`

        const UserRow = new ActionRowBuilder().addComponents(
            new UserSelectMenuBuilder()
                .setCustomId('user-selector')
                .setPlaceholder(vi ? 'Hãy Chọn Người Dùng' : 'Please Choose A User')
                .setMinValues(1)
                .setMaxValues(1)
        )
        const SkipRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('skip')
                .setLabel('[Skip]')
                .setEmoji('1356028568961941636')
                .setStyle(ButtonStyle.Secondary)
        )

        const InputEmbed = await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(UserTitle)
                .setDescription(vi ? `Hãy chọn người dùng để xem thông kê, hoặc bấm nút [<:HikariREE:1356028568961941636> Skip] để xem thống kê của server` : `Please choose the user you want to check the stats, or press [<:HikariREE:1356028568961941636> Skip] for the server's stats`)],
            components: [UserRow, SkipRow]
        })

        const confirm = await InputEmbed.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 30000 }).catch(() => null)
        if (!confirm) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle(`Err - Timed Out`)
                    .setDescription(vi ? `Anh bạn à, cậu không chọn gì à, làm ơn thử lại đi!` : `Bro, you forget to choose anything, please try again!`)],
                components: []
            })
        }
        await confirm.deferUpdate()

        //User stats
        if (confirm.customId === 'user-selector') {
            const targetid = confirm.values[0]
            await interaction.editReply({
                embeds: [SeiaEmbed(interaction).setTitle(UserTitle).setDescription(vi ? `Xin hãy chờ để tớ load thống kê của <@${targetid}>...` : `Please wait for the stats of <@${targetid}>...`)],
                components: []
            })

            const UserObj = await HowgayUser.findOne({ GuildID: interaction.guild.id, UserID: targetid }).lean()
            let desc
            if (!UserObj) {
                desc = vi ? `<a:SeiaMuted:1336385867136241705> Chà, người dùng này <@${targetid}> hiện không có thống kê (có lẽ cậu ta ở trong danh sách miễn hoặc chưa bao giờ dùng lệnh này, lmao)` : `<a:SeiaMuted:1336385867136241705> Well, <@${targetid}> doesn't have any stats for this (maybe they are in the rejection list or have never tested before, lmao)`
            } else {
                const Total = UserObj.Total || 0, Special = UserObj.Special || 0
                const Single = UserObj.Single, Average = UserObj.Average
                desc = vi
                    ? `### Người Dùng: <@${targetid}>\n▸ **Tổng Số Lần Kiểm Tra:** \`${Total}\`\n• **Bình Thường:** \`${Total - Special}\`\n• **Đặc Biệt:** \`${Special}\`\n\n▸ **Max/Min Trong ${HowgayConfig.KeepRecent} Lệnh:**\n• **Check Đơn:** (Max: \`${Percent(Single, Math.max)}%\` -- Min: \`${Percent(Single, Math.min)}%\`)\n• **Trung Bình:** (Max: \`${Percent(Average, Math.max)}%\` -- Min: \`${Percent(Average, Math.min)}%\`)`
                    : `### User: <@${targetid}>\n▸ **Total Checking Usage:** \`${Total}\`\n• **Normal Cases:** \`${Total - Special}\`\n• **Special Cases:** \`${Special}\`\n\n▸ **Max/Min of The ${HowgayConfig.KeepRecent} Recent Usages:**\n• **Non-Average:** (Max: \`${Percent(Single, Math.max)}%\` -- Min: \`${Percent(Single, Math.min)}%\`)\n• **Average:** (Max: \`${Percent(Average, Math.max)}%\` -- Min: \`${Percent(Average, Math.min)}%\`)`
            }

            return interaction.editReply({
                embeds: [SeiaEmbed(interaction)
                    .setTitle(UserTitle)
                    .setDescription(desc)
                    .setThumbnail(AvatarOf(confirm.members?.get(targetid) || confirm.users.get(targetid)))]
            })
        }

        //Server stats: page 1 = normal ranges, page 2 = special cases
        const PageEmbed = (desc) => SeiaEmbed(interaction)
            .setTitle(ServerTitle)
            .setThumbnail(interaction.guild.iconURL({ size: 512 }))
            .setDescription(desc)

        const HowgayData = await HowgayGuild.findOne({ GuildID: interaction.guild.id }).lean()
        const Normal = HowgayData?.Normal || {}, Special = HowgayData?.Special || {}
        const STotal = Object.values(Normal).reduce((a, b) => a + b, 0)

        if (STotal === 0) {
            return interaction.editReply({
                embeds: [PageEmbed(vi ? `<a:SeiaMuted:1336385867136241705> Chà, server **${interaction.guild.name}** chưa có dữ liệu thống kê... xin hãy thử lại sau.` : `<a:SeiaMuted:1336385867136241705> Well, server **${interaction.guild.name}** doesn't have actual data for this... please try again later.`)],
                components: []
            })
        }

        const Head = `## Server: ${interaction.guild.name}\n`

        //Page 1: normal ranges
        let NormalDesc = Head + (vi ? `## **Tổng Số:** \`[${STotal}]\`\n### **Bình Thường:**\n` : `## **Total Usages:** \`[${STotal}]\`\n### **Normal Cases:**\n`)
        HowgayConfig.NormalCases.forEach((Case, i) => {
            const min = (i === 0) ? 0 : HowgayConfig.NormalCases[i - 1].Max
            const max = Math.min(Case.Max - 0.1, HowgayConfig.MaxValue)
            NormalDesc += `▸ ${Case.Emoji} \`Type-${i}\` **(${min.toFixed(1)}% - ${max.toFixed(1)}%)**: **\`[${Normal[i] || 0}]\`**\n`
        })

        //Page 2: every special case of special-cases.js (the total only counts those, so it matches the list)
        const SpecialLines = Object.entries(SpecialCases).map(([key, Case]) => {
            const count = Special[SpecialDbKey(key)] || 0
            return { count, line: `▸ ${Case.emoji} \`${Case.name}\` **(${key}%)**: **\`[${count}]\`**\n` }
        })
        const SSpecial = SpecialLines.reduce((a, b) => a + b.count, 0)
        const SpecialHead = Head + (vi ? `### **Đặc Biệt:** \`[${SSpecial}]\`\n` : `### **Special Cases:** \`[${SSpecial}]\`\n`)

        //A very long special list continues on the next page instead of breaking the embed
        const SpecialPages = [SpecialHead]
        for (const { line } of SpecialLines) {
            if ((SpecialPages[SpecialPages.length - 1] + line).length > 4000) SpecialPages.push(SpecialHead)
            SpecialPages[SpecialPages.length - 1] += line
        }
        if (SpecialLines.length === 0) SpecialPages[0] += vi ? '-# Chưa có case đặc biệt nào...' : '-# No special cases yet...'

        const Pages = [
            { name: vi ? 'Bình Thường' : 'Normal', desc: NormalDesc },
            ...SpecialPages.map(desc => ({ name: vi ? 'Đặc Biệt' : 'Special', desc }))
        ]

        //◀ ▶ buttons for 2 minutes
        await SendPages(interaction, Pages.map(p => PageEmbed(p.desc)), (i, n) => `| ${vi ? 'Trang' : 'Page'} ${i + 1}/${n} • ${Pages[i].name} |`)
    }
}
