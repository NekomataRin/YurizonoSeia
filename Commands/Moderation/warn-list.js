const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed, Cut } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { SendPages } = require('../../Utils/pages')
const Warns = require('../../Database/Moderation/warns')
const { ModE, RequireMod } = require('../../Functions/Moderation/mod')

const PerPage = 10

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn-list')
        .setDescription('-Mod Only- See the warnings of someone on this server')
        .setDescriptionLocalizations({ vi: '-Mod Only- Xem danh sách cảnh cáo của một người trong server' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Whose warnings')
                .setDescriptionLocalizations({ vi: 'Người bạn muốn xem cảnh cáo' })
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (!await RequireMod(interaction, LangKey)) return

        const target = interaction.options.getUser('user')
        const data = await Warns.findOne({ GuildID: interaction.guild.id, UserID: target.id }).lean()
        const List = data?.Warns || []
        const Title = `${ModE.Police} **${vi ? 'Thông tin quản lí' : 'Moderation info'}** - ${target.username}`

        if (!List.length) {
            return interaction.editReply({ embeds: [SeiaEmbed(interaction, 'Green').setTitle(Title)
                .setDescription(vi ? `${ModE.Doi} | ${target} hiện không có lần cảnh cáo nào` : `${ModE.Doi} | ${target} has no warnings`)] })
        }

        const Lines = List.map((w, i) => `> **${i + 1}.** ${Cut(w.Reason, 300)}\n> -# ${vi ? 'Bởi' : 'By'} <@${w.ModID}>${(w.Date) ? ` • <t:${Math.floor(w.Date / 1000)}:R>` : ''}`)
        const Pages = []
        for (let i = 0; i < Lines.length; i += PerPage) {
            Pages.push(SeiaEmbed(interaction, 'Green').setTitle(Title)
                .setDescription(`${vi ? `Số lần cảnh cáo của ${target}: **${List.length}**` : `Warnings of ${target}: **${List.length}**`}\n\n${Lines.slice(i, i + PerPage).join('\n')}\n\n-# ${vi ? 'Xoá một cảnh cáo bằng' : 'Remove one with'} \`/warn-remove\``))
        }
        await SendPages(interaction, Pages, (i, n) => `| ${vi ? 'Trang' : 'Page'} ${i + 1}/${n} |`)
    }
}
