const Language = require('../Database/lang-setup')
const { SeiaEmbed } = require('./embed')
const E = require('../Assets/Defaults/emojis')

// Returns the user's language ('vi' or 'en-US').
// When it isn't set yet, Seia tells them to use /setup-language and this returns null.
async function GetLanguage(interaction) {
    const data = await Language.findOne({ UserID: interaction.user.id }).select('-_id Lang').lean()
    if (data?.Lang) return (data.Lang === 'vi') ? 'vi' : 'en-US'

    const ResponseEmbed = SeiaEmbed(interaction, 'Yellow')
        .setTitle(`${E.Concerned} • **Language Is Not Set**`)
        .setDescription(`${E.Ehem} • Sensei! Please use \`/setup-language\` command in order to use the command! Since v1.4.0, my dad updated my code and added Vietnamese language for this!\n-# > And he is too lazy to add proper vietnamese embed for this lmao`)
    await interaction.editReply({ embeds: [ResponseEmbed] })
    return null
}

module.exports = { GetLanguage }
