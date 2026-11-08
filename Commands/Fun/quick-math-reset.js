const { SlashCommandBuilder } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const QuickMathDb = require('../../Database/Fun/quickmath')
const { RequireMod } = require('../../Functions/Moderation/mod')
const { Confirm } = require('../../Functions/Server/confirm')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quick-math-reset')
        .setDescription('-Mod/Owner Only- Reset every /quick-math score of this server')
        .setDescriptionLocalizations({ vi: '-Mod/Owner Only- Reset toàn bộ điểm /quick-math của server này' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (!await RequireMod(interaction, LangKey, true)) return

        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle('**QuickMath - Reset**').setDescription(desc)
        const choice = await Confirm(interaction, LangKey,
            Embed('White', vi
                ? `<a:LYG_Warning:900776122726367342> **CẢNH BÁO TRƯỚC KHI RESET ĐIỂM SỐ:**\n${interaction.user} • Đây là hành động reset bảng xếp hạng QuickMath **TOÀN BỘ ĐỘ KHÓ** của server này (server khác không bị ảnh hưởng), bạn có chắc rằng bạn muốn reset nó chứ?\n\n<:MikaTired:1416618244281991258> **Đồng ý** || <:murasmile:1519644173118996550> **Giữ lại**`
                : `<a:LYG_Warning:900776122726367342> **WARNING BEFORE RESETTING THE SCORES:**\n${interaction.user} • This resets the QuickMath leaderboard of **EVERY DIFFICULTY** on this server (other servers keep theirs), are you sure?\n\n<:MikaTired:1416618244281991258> **Agree** || <:murasmile:1519644173118996550> **Keep**`),
            Embed('Blue', vi ? '**Đã huỷ bỏ reset điểm số QuickMath trong server rồi nhé!**' : '**QuickMath scores of this server were kept!**'))
        if (!choice) return

        await choice.update({ embeds: [Embed('Yellow', `<:MikaLoading:1416620663405412432> **${vi ? 'Đang reset điểm số của minigame QuickMath...' : 'Resetting the QuickMath scores...'}**`)], components: [] })
        await wait(2000)
        const { deletedCount } = await QuickMathDb.deleteMany({ GuildID: interaction.guild.id })
        await interaction.editReply({ embeds: [Embed('Red', vi ? `**Reset thành công toàn bộ điểm số ở game QuickMath của server rồi nhé!** (\`${deletedCount}\` kỷ lục)` : `**Every QuickMath score of this server was reset!** (\`${deletedCount}\` records)`)] })
    }
}
