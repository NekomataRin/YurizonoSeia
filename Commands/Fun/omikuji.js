const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed, Author } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown, SetCooldown } = require('../../Utils/cooldown')
const Clock = require('../../Utils/clock')
const Config = require('../../Utils/config')
const OmikujiConfig = require('../../Assets/Omikuji/config')
const { GetOmikujiCard } = require('../../Assets/Omikuji/Texts/getembed')
const { OmikujiUser, OmikujiGuild } = require('../../Database/Fun/omikuji')

// Next daily reset (22:00 UTC, Discord's clock). After 22:00 it is tomorrow's 22:00, not today's
function NextReset() {
    const now = new Date(Clock.Now())
    const reset = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), OmikujiConfig.ResetHourUTC, 0, 0, 0)
    return (reset > now.getTime()) ? reset : reset + 24 * 60 * 60 * 1000
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('omikuji')
        .setDescription('-Daily- Get your desired fate of today (Reset Time: 22:00 UTC)'),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        const channelid = Config.Channels.Omikuji
        if (interaction.channel.id !== channelid) {
            let err_desc = vi ? `<:SeiaMuted:1244890584276008970> Oi, đây không phải là kênh chat cho bạn dùng, làm ơn qua <#${channelid}> để dùng nhá!` : `<:SeiaMuted:1244890584276008970> Oi, this isn't the channel for you to use this command, please go to <#${channelid}> to use it!`
            if (interaction.guild.id !== process.env.GUILD_ID) err_desc = vi ? `<:SeiaMuted:1244890584276008970> Lệnh này không hỗ trợ ở đây đâu nhá, mặc dù nó có hiển thị!` : `<:SeiaMuted:1244890584276008970> This command is not supported here, though it is shown here!`
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red').setTitle(`Err - Wrong Channel`).setDescription(err_desc)]
            })
        }

        if (await OnCooldown(interaction, 'Omikuji', LangKey)) return
        await SetCooldown(interaction.user.id, 'Omikuji', NextReset())

        const { Tier, Index, Embed, File } = GetOmikujiCard(LangKey)
        Embed.setAuthor(Author(interaction))
        await interaction.editReply({ embeds: [Embed], files: (File) ? [File] : [] })

        //Stats: tier count (+ card count for SS cards)
        const Inc = { [`Counts.${Tier}`]: 1 }
        if (OmikujiConfig.Cards[Tier]) Inc[`Counts.${Tier}_${Index}`] = 1
        await OmikujiUser.updateOne({ GuildID: interaction.guild.id, UserID: interaction.user.id }, { $inc: Inc }, { upsert: true })
        await OmikujiGuild.updateOne({ GuildID: interaction.guild.id }, { $inc: Inc }, { upsert: true })
    }
}
