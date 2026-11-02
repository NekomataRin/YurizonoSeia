const { SlashCommandBuilder } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Game2048Best = require('../../Database/Fun/game-2048-best')
const { RequireMod } = require('../../Functions/Moderation/mod')
const { Confirm } = require('../../Functions/Server/confirm')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game-2048-reset')
        .setDescription('-Mod Only- Reset every /game-2048 best score of this server')
        .setDescriptionLocalizations({ vi: '-Mod Only- Reset toàn bộ kỷ lục /game-2048 của server này' }),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (!await RequireMod(interaction, LangKey)) return

        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle('**Game 2048 - Reset**').setDescription(desc)
        const choice = await Confirm(interaction, LangKey,
            Embed('White', vi
                ? `<a:LYG_Warning:900776122726367342> **CẢNH BÁO TRƯỚC KHI RESET ĐIỂM SỐ:**\n${interaction.user} • Đây là hành động reset bảng xếp hạng Game 2048 **TOÀN BỘ CHẾ ĐỘ** của server này (server khác không bị ảnh hưởng, ván đang lưu vẫn còn), bạn có chắc rằng bạn muốn reset nó chứ?\n\n<:OrinTired:1147089528906072155> **Đồng ý** || <:FeelsOrin:1152867805692170281> **Giữ lại**`
                : `<a:LYG_Warning:900776122726367342> **WARNING BEFORE RESETTING THE SCORES:**\n${interaction.user} • This resets the Game 2048 leaderboard of **EVERY MODE** on this server (other servers and saved games are kept), are you sure?\n\n<:OrinTired:1147089528906072155> **Agree** || <:FeelsOrin:1152867805692170281> **Keep**`),
            Embed('Blue', vi ? '**Đã huỷ bỏ reset điểm số Game 2048 trong server rồi nhé!**' : '**Game 2048 scores of this server were kept!**'))
        if (!choice) return

        await choice.update({ embeds: [Embed('Yellow', `<a:OrinSway2:1160295832394932326> **${vi ? 'Đang reset điểm số của Game 2048...' : 'Resetting the Game 2048 scores...'}**`)], components: [] })
        await wait(2000)
        const { deletedCount } = await Game2048Best.deleteMany({ guildID: interaction.guild.id })
        await interaction.editReply({ embeds: [Embed('Red', vi ? `**Reset thành công toàn bộ kỷ lục Game 2048 của server rồi nhé!** (\`${deletedCount}\` kỷ lục)` : `**Every Game 2048 best score of this server was reset!** (\`${deletedCount}\` records)`)] })
    }
}
