const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

/*
Shows embeds as pages with ◀ ▶ buttons (only the user who used the command can flip them).
Label(i, total) = text of the middle button. The buttons go away after `Time` ms.
Used by /howgay-stats, /quick-math-top and /game-2048-top.
*/
async function SendPages(interaction, Embeds, Label = (i, n) => `| Page ${i + 1}/${n} |`, Time = 120000) {
    const Buttons = (i) => new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setEmoji('1086297531379613767').setStyle(ButtonStyle.Secondary).setDisabled(i === 0),
        new ButtonBuilder().setCustomId('page').setLabel(Label(i, Embeds.length)).setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('next').setEmoji('1086297678624854077').setStyle(ButtonStyle.Secondary).setDisabled(i === Embeds.length - 1)
    )
    const Page = (i) => ({ content: '', embeds: [Embeds[i]], components: (Embeds.length > 1) ? [Buttons(i)] : [] })

    let current = 0
    const message = await interaction.editReply(Page(0))
    if (Embeds.length < 2) return

    const collector = message.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: Time })
    collector.on('collect', async (i) => {
        current = (i.customId === 'next') ? Math.min(current + 1, Embeds.length - 1) : Math.max(current - 1, 0)
        await i.update(Page(current)).catch(() => {})
    })
    collector.on('end', () => interaction.editReply({ components: [] }).catch(() => {}))
}

module.exports = { SendPages }
