const { MessageFlags } = require('discord.js')
const Language = require('../Database/lang-setup')
const { DbReady } = require('../Database/connect')
const { SeiaEmbed } = require('./embed')
const E = require('../Assets/Defaults/emojis')

// Saved language of a user ('vi' / 'en-US'), null when it isn't set.
// Throws when the database is down (right away, it doesn't wait for it to come back)
async function SavedLanguage(UserID) {
    if (!DbReady()) throw new Error('The database is not connected')
    const data = await Language.findOne({ UserID }).select('-_id Lang').lean()
    if (!data?.Lang) return null
    return (data.Lang === 'vi') ? 'vi' : 'en-US'
}

// Discord app language of the user, for messages shown before they chose one
const LocaleLang = (interaction) => (interaction.locale === 'vi') ? 'vi' : 'en-US'

// "Please use /setup-language" (in their Discord language). Works before deferReply too, then only they see it
async function AskLanguage(interaction) {
    const vi = (LocaleLang(interaction) === 'vi')
    const ResponseEmbed = SeiaEmbed(interaction, 'Yellow')
        .setTitle(`${E.Concerned} • **${vi ? 'Chưa Chọn Ngôn Ngữ' : 'Language Is Not Set'}**`)
        .setDescription(vi
            ? `${E.Ehem} • Sensei ơi! Sensei dùng lệnh \`/setup-language\` để chọn ngôn ngữ trước rồi mới dùng lệnh được nhé! Từ v1.4.0, bố em đã cập nhật code và thêm tiếng Việt cho em rồi đó!`
            : `${E.Ehem} • Sensei! Please use \`/setup-language\` command in order to use the command! Since v1.4.0, my dad updated my code and added Vietnamese language for this!\n-# > And he is too lazy to add proper vietnamese embed for this lmao`)
    if (interaction.deferred || interaction.replied) await interaction.editReply({ content: '', embeds: [ResponseEmbed], components: [], files: [] })
    else await interaction.reply({ embeds: [ResponseEmbed], flags: MessageFlags.Ephemeral })
}

// Returns the user's language ('vi' or 'en-US').
// When it isn't set yet, Seia tells them to use /setup-language and this returns null
async function GetLanguage(interaction) {
    const Saved = await SavedLanguage(interaction.user.id)
    if (Saved) return Saved
    await AskLanguage(interaction)
    return null
}

module.exports = { GetLanguage, SavedLanguage, AskLanguage, LocaleLang }
