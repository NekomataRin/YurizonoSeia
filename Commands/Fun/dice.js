const { SlashCommandBuilder } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

// Faces 1 → 6
const DiceEmojis = [
    '<:LYG_Dice1:1090613349571629096>',
    '<:LYG_Dice2:1090613355967959140>',
    '<:LYG_Dice3:1090613362292969512>',
    '<:LYG_Dice4:1090613368731226263>',
    '<:LYG_Dice5:1090613373198155846>',
    '<:LYG_Dice6:1090613378923372544>'
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll some 6-sided dice')
        .setDescriptionLocalizations({ vi: 'Tung xúc xắc (loại 6 mặt)' })
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('How many dice (max 10) - Default: 1')
                .setDescriptionLocalizations({ vi: 'Số lượng xúc xắc (tối đa 10) - Mặc định: 1' })
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'Dice', LangKey, 15000)) return

        const user = interaction.user
        const Rolls = Array.from({ length: interaction.options.getInteger('quantity') || 1 }, () => Math.floor(Math.random() * 6) + 1)
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle(`<a:LYG_DiceRoll:1090613205149175941> ${vi ? 'Game: Tung xúc xắc' : 'Game: Dice'}`).setDescription(desc)

        await interaction.editReply({ embeds: [Embed('White', `<a:LYG_FubukiWhat:1084085930266218556> ${vi ? `Đang tung xúc xắc cho ${user}... *(xin chờ một lát...)*` : `Rolling the dice for ${user}... *(please wait...)*`}`)] })
        await wait(2500)

        //One die at a time, then the total
        const Lines = []
        for (const [i, v] of Rolls.entries()) {
            Lines.push(vi ? `> Kết quả roll xúc xắc **lần ${i + 1}** là: ${DiceEmojis[v - 1]} \`${v} nút\`` : `> Roll **#${i + 1}**: ${DiceEmojis[v - 1]} \`${v}\``)
            await interaction.editReply({ embeds: [Embed('Grey', Lines.join('\n'))] })
            await wait(1000)
        }
        const Total = Rolls.reduce((a, b) => a + b, 0)
        await interaction.editReply({ embeds: [Embed('White', `${Lines.join('\n')}\n<a:LYG_FubukiWhat:1084085930266218556> ${vi ? `Tổng số nút đã roll của ${user} là: **${Total} nút**` : `${user}'s total: **${Total}**`}`)] })
    }
}
