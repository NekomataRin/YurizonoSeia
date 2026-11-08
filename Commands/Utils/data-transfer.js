const { SlashCommandBuilder } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Level = require('../../Database/Ranking/Leveling')
const UserCards = require('../../Database/Ranking/usercards')
const { RequireMod } = require('../../Functions/Moderation/mod')
const { Confirm } = require('../../Functions/Server/confirm')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('data-transfer')
        .setDescription('-Mod/Owner Only- Move the ranking data of an old account to a new one')
        .setDescriptionLocalizations({ vi: '-Mod/Owner Only- Chuyển dữ liệu ranking của tài khoản cũ sang tài khoản mới' })
        .addUserOption(option =>
            option.setName('old-user')
                .setDescription('The old account')
                .setDescriptionLocalizations({ vi: 'Người dùng cũ cần chuyển' })
                .setRequired(true))
        .addUserOption(option =>
            option.setName('new-user')
                .setDescription('The new account')
                .setDescriptionLocalizations({ vi: 'Người dùng mới nhận dữ liệu' })
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (!await RequireMod(interaction, LangKey, true)) return

        const OUser = interaction.options.getUser('old-user')
        const NUser = interaction.options.getUser('new-user')
        const Title = `<:KayokoThinking:1262268455499862036> **${interaction.guild.name} - Data Transfer**`
        const Users = vi
            ? `> **Người dùng cũ:** ${OUser} \`(${OUser.id})\`\n> **Người dùng mới:** ${NUser} \`(${NUser.id})\``
            : `> **Old account:** ${OUser} \`(${OUser.id})\`\n> **New account:** ${NUser} \`(${NUser.id})\``
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle(Title).setDescription(desc)

        if (OUser.id === NUser.id) {
            return interaction.editReply({ embeds: [Embed('DarkAqua', vi ? '<:LYG_KeqingDoi:1086190826536849499> | Bruh, cả hai ID giống nhau thì em chuyển làm gì cho mệt? Cần 2 người dùng khác nhau chứ!' : '<:LYG_KeqingDoi:1086190826536849499> | Bruh, both are the same account, why would I move anything? I need 2 different users!')] })
        }
        const Old = await Level.findOne({ GuildID: interaction.guild.id, UserID: OUser.id }).lean()
        if (!Old) return interaction.editReply({ embeds: [Embed('DarkAqua', vi ? `<:LYG_KeqingDoi:1086190826536849499> | ${OUser} chưa có dữ liệu ranking nào ở server này cả` : `<:LYG_KeqingDoi:1086190826536849499> | ${OUser} has no ranking data on this server`)] })

        const choice = await Confirm(interaction, LangKey,
            Embed('Blurple', vi
                ? `<:KayokoConfused:1262266983739691138> **Bạn có chắc chắn muốn chuyển dữ liệu chứ?**\n${Users}\n> Rank (Level \`${Old.level}\`, tổng \`${Old.total}\` EXP, background) + card đã mở khoá của server này\n<:SeiaMenacing:1244890322090201162> **CẢNH BÁO:** Dữ liệu ranking của người dùng mới ở server này sẽ bị thay thế, một khi đã làm là không thể sửa!`
                : `<:KayokoConfused:1262266983739691138> **Are you sure you want to move the data?**\n${Users}\n> Ranking of this server (Level \`${Old.level}\`, \`${Old.total}\` total EXP, background) + cards unlocked on this server\n<:SeiaMenacing:1244890322090201162> **WARNING:** The new account's ranking data on this server gets replaced, this can't be undone!`),
            Embed('Blue', vi ? '<:KazusaThumbsup:1245237990108696667> **Đã huỷ bỏ chuyển dữ liệu rồi nhé!**' : '<:KazusaThumbsup:1245237990108696667> **Data transfer cancelled!**'))
        if (!choice) return

        await choice.update({ embeds: [Embed('Yellow', `<:MikaLoading:1416620663405412432> **${vi ? 'Đang chuyển dữ liệu...' : 'Moving the data...'}**\n${Users}`)], components: [] })
        await wait(2000)

        //Ranking of this server: the new account takes the old one's document
        const GuildID = interaction.guild.id
        await Level.deleteOne({ GuildID, UserID: NUser.id })
        await Level.updateOne({ GuildID, UserID: OUser.id }, { $set: { UserID: NUser.id } })
        //Unlocked cards of this server: added to the new account
        const OldCards = await UserCards.findOne({ GuildID, UserID: OUser.id }).lean()
        if (OldCards?.Cards?.length) {
            await UserCards.updateOne({ GuildID, UserID: NUser.id }, { $addToSet: { Cards: { $each: OldCards.Cards } } }, { upsert: true })
            await UserCards.deleteOne({ GuildID, UserID: OUser.id })
        }

        await interaction.editReply({ embeds: [Embed('Green', `<:KikyouWink:1415972415204491405> **${vi ? 'Đã chuyển dữ liệu thành công!' : 'Data moved!'}**\n${Users}${(OldCards?.Cards?.length) ? `\n> ${vi ? 'Card đã chuyển' : 'Cards moved'}: \`${OldCards.Cards.length}\`` : ''}`)] })
    }
}
