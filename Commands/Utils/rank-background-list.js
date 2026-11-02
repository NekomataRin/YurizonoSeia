const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { SendPages } = require('../../Utils/pages')
const Level = require('../../Database/Ranking/Leveling')
const { FindCard } = require('../../Assets/RankCards')
const { RequireMod } = require('../../Functions/Moderation/mod')

const PerPage = 10

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank-background-list')
        .setDescription('-Mod Only- See which members use a rank card background on this server')
        .setDescriptionLocalizations({ vi: '-Mod Only- Xem các thành viên đang dùng background rank card trong server' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (!await RequireMod(interaction, LangKey)) return

        //Everyone with a background (not the default card) on this server, grouped by card
        const Users = await Level.find({ GuildID: interaction.guild.id, background: { $nin: ['none', null] } }).select('-_id UserID background').sort({ background: 1, UserID: 1 }).lean()
        const Title = `<:YuyukoWoah:1152872168439423050> **${interaction.guild.name} - Keyword Ranking**`
        if (!Users.length) {
            return interaction.editReply({ embeds: [SeiaEmbed(interaction, 'Blurple').setTitle(Title)
                .setDescription(vi ? '<:seiaconcerned:1244128341540208793> **Không có đủ số liệu**, chưa có ai dùng background nào cả... Chờ đến khi nào có người dùng rồi xem tiếp nhé!' : '<:seiaconcerned:1244128341540208793> **No data yet**, nobody uses a background on this server... Check again later!')] })
        }

        const Lines = Users.map(u => `> **User:** <@${u.UserID}>\n> **Keyword:** ${FindCard(u.background).Emoji} \`${u.background}\``)
        const Pages = []
        for (let i = 0; i < Lines.length; i += PerPage) {
            Pages.push(SeiaEmbed(interaction, 'Blurple').setTitle(Title)
                .setDescription(`${Lines.slice(i, i + PerPage).join('\n\n')}\n\n<a:LYG_TighnariNotes:1090126010571300874> • ${vi ? `Tổng cộng **${Users.length}** người` : `**${Users.length}** members in total`}`))
        }
        await SendPages(interaction, Pages, (i, n) => `| ${vi ? 'Trang' : 'Page'} ${i + 1}/${n} |`)
    }
}
