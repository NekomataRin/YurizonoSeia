const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { V2 } = require('../../Utils/container')

/*
"Are you sure?" buttons ([Agree] = MikaTired, [Keep] = murasmile) inside the box (Components V2):
shows `Embed` with [Agree] [Keep], only the user who used the command can answer.
Returns the button interaction when they agree (to update the message after), null when they keep it / don't answer in time
(the message then shows `Kept`).
The message is a V2 one: the caller's next updates / edits of it must use V2() too.
*/
async function Confirm(interaction, LangKey, Embed, Kept, Time = 60000) {
    const vi = (LangKey === 'vi')
    const Buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('confirm').setLabel(vi ? '| Đồng ý' : '| Agree').setEmoji('1416618244281991258').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('abort').setLabel(vi ? '| Giữ lại' : '| Keep').setEmoji('1519644173118996550').setStyle(ButtonStyle.Secondary)
    )
    const message = await interaction.editReply(V2({ embeds: [Embed], components: [Buttons] }))
    const choice = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: Time }).catch(() => null)
    if (choice?.customId === 'confirm') return choice
    if (choice) await choice.update(V2({ embeds: [Kept] })).catch(() => {})
    else await interaction.editReply(V2({ embeds: [Kept] })).catch(() => {})
    return null
}

module.exports = { Confirm }
