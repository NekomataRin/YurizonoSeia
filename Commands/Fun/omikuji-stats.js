const { SlashCommandBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const { SeiaEmbed, AvatarOf } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const OmikujiConfig = require('../../Assets/Omikuji/config')
const { OmikujiUser, OmikujiGuild } = require('../../Database/Fun/omikuji')

// Counts -> "• **C-Tier:** `n`" lines (+ one line per card for SS)
function StatsLines(Counts = {}) {
    let total = 0, lines = ''
    for (const Tier of OmikujiConfig.Key) {
        const count = Counts[Tier] || 0
        total += count
        lines += `\n• **${Tier}:** ${(OmikujiConfig.Cards[Tier]) ? '' : `\`${count}\``}`
        OmikujiConfig.Cards[Tier]?.forEach((name, i) => lines += `\n> ▸ **${name}:** \`${Counts[`${Tier}_${i}`] || 0}\``)
    }
    return { total, lines }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('omikuji-stats')
        .setDescription('Show the stats of the user\'s daily omikuji usage, or server')
        .setDescriptionLocalizations({ vi: 'Thống kê số lần sử dụng lệnh /omikuji mỗi ngày của người dùng, hoặc là cả server' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        const UserTitle = vi ? `🎋 Thống Kê Lượt Dùng Omikuji Của Người Dùng` : `🎋 Checking Omikuji Stats Of A User`
        const ServerTitle = vi ? `🎋 Thống Kê Lượt Dùng Omikuji Của Toàn Server` : `🎋 Checking Omikuji Stats Of Server`

        if (interaction.guild.id !== process.env.GUILD_ID) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle(`Err - Wrong Channel`)
                    .setDescription(vi ? `<:SeiaMuted:1244890584276008970> Lệnh này không hỗ trợ ở đây đâu nhá, mặc dù nó có hiển thị!` : `<:SeiaMuted:1244890584276008970> This command is not supported here, though it is shown here!`)]
            })
        }

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

            const UserObj = await OmikujiUser.findOne({ GuildID: interaction.guild.id, UserID: targetid }).lean()
            const { total, lines } = StatsLines(UserObj?.Counts)
            const desc = (!UserObj || total === 0)
                ? (vi ? `<a:SeiaMuted:1336385867136241705> Chà, <@${targetid}> không hề có thống kê luôn á, đồng nghĩa họ chưa bao giờ test nhân phẩm mỗi ngày cả... ` : `<a:SeiaMuted:1336385867136241705> Well, <@${targetid}> doesn't have any stats for this, which means they have never test their daily luck, after all...`)
                : (vi ? `### Người Dùng: <@${targetid}>\n▸ **Tổng số lần dùng:** \`${total}\`${lines}` : `### User: <@${targetid}>\n▸ **Total Checking Usage:** \`${total}\`${lines}`)

            return interaction.editReply({
                embeds: [SeiaEmbed(interaction)
                    .setTitle(UserTitle)
                    .setDescription(desc)
                    .setThumbnail(AvatarOf(confirm.members?.get(targetid) || confirm.users.get(targetid)))]
            })
        }

        //Server stats
        const ServerEmbed = SeiaEmbed(interaction)
            .setTitle(ServerTitle)
            .setThumbnail(interaction.guild.iconURL({ size: 512 }))

        const OmikujiData = await OmikujiGuild.findOne({ GuildID: interaction.guild.id }).lean()
        const { total, lines } = StatsLines(OmikujiData?.Counts)
        if (total === 0) {
            return interaction.editReply({
                embeds: [ServerEmbed.setDescription(vi ? `<a:SeiaMuted:1336385867136241705> Chà, server **${interaction.guild.name}** chưa có dữ liệu thống kê... xin hãy thử lại sau.` : `<a:SeiaMuted:1336385867136241705> Well, server **${interaction.guild.name}** doesn't have actual data for this... please try again later.`)],
                components: []
            })
        }

        await interaction.editReply({
            embeds: [ServerEmbed.setDescription(vi ? `### Server: \`${interaction.guild.name}\`\n▸ **Tổng Lượt Dùng Lệnh:** \`${total}\`${lines}` : `### Server: \`${interaction.guild.name}\`\n▸ **Total Checking Usage:** \`${total}\`${lines}`)],
            components: []
        })
    }
}
