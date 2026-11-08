const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Level = require('../../Database/Ranking/Leveling')
const UserCards = require('../../Database/Ranking/usercards')
const { RankCards } = require('../../Assets/RankCards')
const { RequireMod } = require('../../Functions/Moderation/mod')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('background-manage')
        .setDescription('-Mod/Owner Only- Set / add / remove a rank card of a user (or yours)')
        .setDescriptionLocalizations({ vi: '-Mod/Owner Only- Đặt / thêm / gỡ rank card của một người dùng (hoặc của bạn)' })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Whose cards - Default: yours')
                .setDescriptionLocalizations({ vi: 'Card của ai - Mặc định: của bạn' })
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('The keyword of the background (ex. shiroko, hoshino...)')
                .setDescriptionLocalizations({ vi: 'Keyword của background (vd: shiroko, hoshino...)' })
                .setRequired(false)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('method')
                .setDescription('Method of the keyword for that user (Default: [Set])')
                .setDescriptionLocalizations({ vi: 'Cách áp dụng keyword cho người dùng đó (Mặc định: [Set])' })
                .addChoices(
                    { name: '[Add]', value: 'add', name_localizations: { vi: '[Add] Thêm vào danh sách' } },
                    { name: '[Remove]', value: 'remove', name_localizations: { vi: '[Remove] Gỡ khỏi danh sách' } },
                    { name: '[Set]', value: 'set', name_localizations: { vi: '[Set] Đặt làm background' } },
                )
                .setRequired(false)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase()
        const filtered = RankCards.map(card => card.Key).filter(key => key.startsWith(focusedValue)).slice(0, 25)
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })))
    },

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        //Mod roles of this server (Utils/config.js Roles) or a bot owner
        if (!await RequireMod(interaction, LangKey, true)) return

        const user = (interaction.options.getUser('user') || interaction.user).id
        const GuildID = interaction.guild.id
        const key = (interaction.options.getString('keyword') || 'none').trim().toLowerCase()
        const MethodValue = interaction.options.getString('method') || 'set'

        const Reply = (title, desc, color = 'Yellow') => interaction.editReply({
            content: '',
            embeds: [SeiaEmbed(interaction, color)
                .setTitle(`<:seiaheh:1244128244664504392> • ${title}`)
                .setDescription(`<:seiaehem:1244128370669650060> • ${desc}`)]
        })
        const Ignored = () => Reply(vi ? 'Key đã bị bỏ qua.' : 'The key has been ignored.', vi ? `Key '\`${key}\`' này chả có tác dụng gì với <@${user}> cả, lol` : `The following key: '\`${key}\`' does not have any effect on <@${user}>, lol`)

        if (!RankCards.some(card => card.Key === key)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Key không hợp lệ' : 'Invalid Key'}`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? `Keyword \`${key}\` không hợp lệ, nó không có trong danh sách key...` : `You provided an invalid ranking keyword \`${key}\`... It's not in the key list provided...`}`)]
            })
        }

        //[Set]: equip it on this server (+ unlock it here if needed)
        if (MethodValue === 'set') {
            const data = await Level.findOne({ GuildID, UserID: user })
            if (!data) return interaction.editReply(vi ? '<:seiaheh:1244128244664504392> • Có vẻ người dùng này chưa hoạt động ở server... Thử lại sau nhé...' : '<:seiaheh:1244128244664504392> • Looks like the user you chose is currently not active yet... Please try again later...')

            if (key === 'none' && data.background === key) {
                return Reply(vi ? 'Bỏ qua key' : 'Key skipped', vi ? `Vì Sensei ghi '\`${key}\`' nên em bỏ qua cho <@${user}> luôn nhé...` : `Since you wrote '\`${key}\`', I skipped this for <@${user}> for now...`, 'DarkButNotBlack')
            }

            data.background = key
            await data.save()

            let desc = (key === 'none')
                ? (vi ? `Đã khôi phục background mặc định cho <@${user}>` : `Successfully restored the default card background for <@${user}>`)
                : (vi ? `Đã đặt background rank card '\`${key}\`' cho <@${user}>` : `Successfully set the rank card background '\`${key}\`' for <@${user}>`)
            if (key !== 'none') {
                const added = await UserCards.updateOne({ GuildID, UserID: user }, { $addToSet: { Cards: key } }, { upsert: true })
                if (added.modifiedCount || added.upsertedCount) desc += (vi) ? `\nĐồng thời em đã thêm '\`${key}\`' vào danh sách card của <@${user}>` : `\nAlso, I added the rank card background '\`${key}\`' to the list for <@${user}>`
            }
            return Reply(vi ? 'Đã đặt key thành công.' : 'The key has been successfully set.', desc)
        }

        //[Add] / [Remove]: only change the unlocked list of this server
        if (key === 'none') return Ignored()

        const update = (MethodValue === 'add') ? { $addToSet: { Cards: key } } : { $pull: { Cards: key } }
        const result = await UserCards.updateOne({ GuildID, UserID: user }, update, { upsert: MethodValue === 'add' })
        if (!result.modifiedCount && !result.upsertedCount) return Ignored()

        return (MethodValue === 'add')
            ? Reply(vi ? 'Đã thêm key thành công.' : 'The key has been successfully added.', vi ? `Đã thêm background '\`${key}\`' vào danh sách của <@${user}>` : `Successfully added the rank card background '\`${key}\`' to the list for <@${user}>`)
            : Reply(vi ? 'Đã gỡ key thành công.' : 'The key has been successfully removed.', vi ? `Đã gỡ background '\`${key}\`' khỏi danh sách của <@${user}>` : `Successfully removed the rank card background '\`${key}\`' from the list of <@${user}>`)
    }
}
