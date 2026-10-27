const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')
const { ReqExp } = require('../../Utils/Ranking/lvlcalc')
const Level = require('../../Database/Ranking/Leveling')
const { FindCard, RankCards } = require('../../Assets/RankCards')
const { RankCard, RankColor } = require('../../Functions/Ranking/rank-card')

// Position in the server leaderboard (sorted by total EXP, same EXP = same rank)
async function GetRank(GuildID, total) {
    return await Level.countDocuments({ GuildID, total: { $gt: total } }) + 1
}

// Restricted users get their own card colors
const RestrictStyle = {
    'Code-1': { Color: '#222222', RankingColor: '#000000', DefaultCard: true },
    'Code-2': { Color: '#abad03', RankingColor: '#abad03' },
    'Code-3': { Color: '#ad0303', RankingColor: '#ad0303' }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check a user\'s rank, or your rank in the server')
        .setDescriptionLocalizations({ vi: 'Kiểm tra xếp hạng của người dùng, hoặc của bạn trong server' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User where you want to check the ranking')
                .setDescriptionLocalizations({ vi: 'Người dùng bạn muốn xem xếp hạng của họ' })
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const cdtime = 10000

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        const user = interaction.options.getUser('user') || interaction.user
        const user_ = await interaction.guild.members.fetch(user.id).catch(() => null)

        const FetchedLevel = await Level.findOne({ GuildID: interaction.guild.id, UserID: user.id }).lean()
        if (!FetchedLevel) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'DarkGreen')
                    .setTitle(`<:seiaconcerned:1244128341540208793> ${vi ? '**Không có thông tin xếp hạng**' : '**No ranking data provided**'}`)
                    .setDescription(`<:seiaehem:1244128370669650060> ${vi ? `Không may, ${user} hiện không có thông tin xếp hạng, hãy thử lại sau nhé...` : `Unfortunately, ${user} has no ranking data, please try again later...`}`)]
            })
        }

        if (await OnCooldown(interaction, 'Rank', LangKey, cdtime)) return

        const Data = { level: FetchedLevel.level || 0, exp: FetchedLevel.exp || 0, total: FetchedLevel.total || 0 }
        const CurrentRank = await GetRank(interaction.guild.id, Data.total)
        const Restrict = FetchedLevel.restrict || 'Code-0'
        const Style = RestrictStyle[Restrict]

        const Card = { ...((Style?.DefaultCard) ? RankCards[0] : FindCard(FetchedLevel.background)) }
        if (Style) {
            Card.Color = Style.Color
            Card.Title = `Restricted: ${Restrict}`
        }

        const Image = await RankCard({
            user,
            avatarURL: (user_ || user).displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 }),
            Card,
            Data,
            Rank: CurrentRank,
            ReqExp: ReqExp(Data.level),
            RankingColor: Style?.RankingColor || RankColor(CurrentRank)
        })
        const attachment = new AttachmentBuilder(Image, { name: `${user.id}-rank.png` })

        let desc = vi ? `[${Card.Emoji}] Thứ Hạng Của ${user}` : `[${Card.Emoji}] ${user}'s Ranking`
        if (Style) desc += vi ? `\n-# ==NGƯỜI DỤNG NÀY HIỆN ĐANG BỊ HẠN CHẾ [${Restrict}]==` : `\n-# ==THIS USER HAS BEEN RESTRICTED [${Restrict}]==`

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, Card.Color)
                .setTitle(vi ? '**Xếp Hạng Server**' : '**Server Ranking**')
                .setDescription(desc)
                .setImage(`attachment://${user.id}-rank.png`)],
            files: [attachment]
        })
    }
}
