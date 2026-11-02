const { MessageFlags } = require('discord.js')
const Log = require('../../Utils/logger')
const Clock = require('../../Utils/clock')
const { BlockRestricted } = require('../../Functions/Moderation/restrict')
const { SavedLanguage, LocaleLang } = require('../../Utils/language')

module.exports = async (client, interaction) => {
    //Keeps Seia's clock in line with Discord's (cooldowns use it)
    Clock.Sync(interaction.createdTimestamp)

    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return
    if (!interaction.inCachedGuild()) return

    const command = client.commands.get(interaction.commandName)
    if (!command) return

    if (interaction.isAutocomplete()) {
        if (!command.autocomplete) return
        try {
            await command.autocomplete(interaction)
        } catch (err) {
            Log.Error(`Autocomplete /${interaction.commandName}:`, err)
            await interaction.respond([]).catch(() => {})
        }
        return
    }

    try {
        Log.Debug(`/${interaction.commandName} by ${interaction.user.username} (${interaction.user.id})`)
        //Restricted by a Mod (/restrict): every command except /help and /setup-language
        if (await BlockRestricted(interaction)) return
        await command.execute(interaction)
    } catch (err) {
        Log.Error(`Command /${interaction.commandName}:`, err)

        //Tell the user instead of leaving "Seia is thinking..." forever
        const vi = ((await SavedLanguage(interaction.user.id).catch(() => null)) || LocaleLang(interaction)) === 'vi'
        const content = (vi)
            ? '<a:SeiaMuted:1336385867136241705> Sensei... có lỗi gì đó khi chạy lệnh này rồi. Sensei thử lại sau nhé!'
            : '<a:SeiaMuted:1336385867136241705> Sensei... something went wrong while running this command. Please try again later!'
        if (interaction.deferred || interaction.replied) await interaction.editReply({ content, embeds: [], components: [], files: [] }).catch(() => {})
        else await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => {})
    }
}
