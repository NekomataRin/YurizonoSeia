const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

const Bases = {
    DEC: { Radix: 10n, Color: 'Green' },
    HEX: { Radix: 16n, Color: 'Yellow' },
    BIN: { Radix: 2n, Color: 'Blue' },
    OCT: { Radix: 8n, Color: 'Purple' }
}
const Digits = '0123456789ABCDEF'

// Text in that base -> exact number (BigInt: 32 digits are too big for normal numbers), null = not a valid number
function Parse(text, Base) {
    if (!text) return null
    const radix = Number(Bases[Base].Radix)
    let n = 0n
    for (const ch of text) {
        const d = Digits.indexOf(ch)
        if (d < 0 || d >= radix) return null
        n = n * Bases[Base].Radix + BigInt(d)
    }
    return n
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('number-convert')
        .setDescription('Convert a positive whole number between DEC, HEX, BIN and OCT')
        .setDescriptionLocalizations({ vi: 'Quy đổi một số nguyên dương giữa các hệ DEC, HEX, BIN và OCT' })
        .addStringOption(option =>
            option.setName('number')
                .setDescription('The number (32 digits max), you pick its base after')
                .setDescriptionLocalizations({ vi: 'Giá trị số nhập vào (tối đa 32 chữ số), chọn hệ của nó sau' })
                .setMaxLength(32)
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'NumberConvert', LangKey, 10000)) return

        const Input = interaction.options.getString('number').trim().toUpperCase()
        const Title = `<a:LYG_GanyuNap:1096457111094964277> **${vi ? 'Quy đổi số' : 'Number Converter'}**`
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle(Title).setDescription(desc)
        const Buttons = new ActionRowBuilder().addComponents(Object.keys(Bases).map(b => new ButtonBuilder().setCustomId(b).setLabel(`[${b}]`).setStyle(ButtonStyle.Primary)))

        //Which base is the typed number in?
        const message = await interaction.editReply({
            embeds: [Embed('Default', `<:NoaNoted:1247028261847040050> | ${vi ? 'Quy đổi số' : 'Number'}: (**${Input}**)\n\n**${vi ? 'Hãy chọn nút bên dưới để chọn kiểu giá trị nhập vào nhé!!!' : 'Pick the base of that number with the buttons below!!!'}**\n• [DEC] • [HEX] • [BIN] • [OCT]`)],
            components: [Buttons]
        })
        const click = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 30000 }).catch(() => null)
        if (!click) return interaction.editReply({ components: [] }).catch(() => {})

        const Base = click.customId
        const Value = Parse(Input, Base)
        if (Value === null) {
            return click.update({ embeds: [Embed('Red', `<:NoaNoted:1247028261847040050> | ${vi ? `Oi! Bạn đã nhập sai định dạng số **[${Base}]** rồi! (**${Input}**)` : `Oi! **${Input}** isn't a valid **[${Base}]** number!`}`)], components: [] })
        }

        await click.update({ embeds: [Embed('Grey', `<a:LYG_Loading:900784653701627925> | ${vi ? `${interaction.user}... xin chờ một lát, số sẽ được chuyển đổi: **[${Base}]** \`${Input}\`` : `${interaction.user}... please wait, converting **[${Base}]** \`${Input}\``}`)], components: [] })
        await wait(2500)

        const Results = Object.keys(Bases).filter(b => b !== Base).map(b => `> [${b}] ${Value.toString(Number(Bases[b].Radix)).toUpperCase()}`)
        await interaction.editReply({ embeds: [Embed(Bases[Base].Color, `<a:LYG_TighnariNotes:1090126010571300874> | **${vi ? 'Số cần quy đổi' : 'Number'}:** **[${Base}]** \`${Input}\`\n\n${Results.join('\n')}`)] })
    }
}
