const { MessageFlags } = require('discord.js')
const Log = require('../../Utils/logger')
const Clock = require('../../Utils/clock')

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
        await command.execute(interaction)
    } catch (err) {
        Log.Error(`Command /${interaction.commandName}:`, err)

        //Tell the user instead of leaving "Seia is thinking..." forever
        const content = '<a:SeiaMuted:1336385867136241705> Sensei... something went wrong while running this command. Please try again later!'
        if (interaction.deferred || interaction.replied) await interaction.editReply({ content, embeds: [], components: [], files: [] }).catch(() => {})
        else await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => {})
    }
}
