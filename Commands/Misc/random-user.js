const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed, AvatarOf } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Rejected = require('../../Assets/Howgay/rejected')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random-user')
        .setDescription('Pick a random user who aren\'t OFFLINE or BOT (with some exception)')
        .setDescriptionLocalizations({ vi: 'Chọn ngẫu nhiên một người đang online, không phải bot (có vài ngoại lệ)' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        const allMembers = await interaction.guild.members.fetch({ withPresences: true })
        const onlineMembers = allMembers.filter(member =>
            member.presence && member.presence.status !== 'offline' && !member.user.bot && !Rejected[member.user.id]
        )

        if (onlineMembers.size === 0) {
            return interaction.editReply(vi ? '<:seiaconcerned:1244128341540208793> Hmm... giờ chả có ai online cả bố ơi. Thử lại sau nhé!' : '<:seiaconcerned:1244128341540208793> Hmm... nobody is online right now, Dad. Try again later!')
        }

        const target = onlineMembers.random()
        const rollNo = Math.floor(Math.random() * 10) + 1

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction)
                .setTitle(vi ? `<:seiaconcerned:1244128341540208793> **'Nạn nhân ngẫu nhiên'** **\`/howgay\`** hằng ngày` : `<:seiaconcerned:1244128341540208793> Daily **\`/howgay\`** 'Random Victim'`)
                .setDescription(vi
                    ? `<:seiaheh:1244128244664504392> Bố ơi! "Nạn nhân" hôm nay của bố đây nè!\n> **Người dùng:** ${target}\n> **Số lần roll:** **\`${rollNo}\`**`
                    : `<:seiaheh:1244128244664504392> Dad! Here's your today "victim"!\n> **User:** ${target}\n> **Number of Rolls:** **\`${rollNo}\`**`)
                .setThumbnail(AvatarOf(target))]
        })
    }
}
