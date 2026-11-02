const { SlashCommandBuilder } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')

const Faces = {
    Head: { Emoji: '<:LYG_chead:1092473155802640384>', vi: 'Ngửa' },
    Tail: { Emoji: '<:LYG_ctail:1090615312690466847>', vi: 'Sấp' },
    Stand: { Emoji: '<a:LYG_404:1086172141998833684>', vi: 'Đứng' }
}
const Colors = { Win: '#09FF00', Stand: '#00C1FF', Lose: '#CF0000' }

// 0 → 6000: below 3000 = Head, above = Tail, exactly 3000 = Stand (1/6001, "1/6000")
function Flip() {
    const r = Math.floor(Math.random() * 6001)
    return (r < 3000) ? 'Head' : (r > 3000) ? 'Tail' : 'Stand'
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin (3 possible results!)')
        .setDescriptionLocalizations({ vi: 'Tung đồng xu vui (có 3 trường hợp nhá)' })
        .addStringOption(option =>
            option.setName('facing')
                .setDescription('Your guess: Head, Tail... or Stand (1/6000)')
                .setDescriptionLocalizations({ vi: 'Mặt bạn đoán: Ngửa, Sấp... hoặc Đứng (1/6000)' })
                .addChoices(
                    { name: 'Head', value: 'Head', name_localizations: { vi: 'Ngửa (Head)' } },
                    { name: 'Tail', value: 'Tail', name_localizations: { vi: 'Sấp (Tail)' } },
                    { name: 'Stand', value: 'Stand', name_localizations: { vi: 'Đứng (Stand)' } })
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        if (await OnCooldown(interaction, 'Coinflip', LangKey, 15000)) return

        const user = interaction.user
        const Name = (face) => (vi) ? `${Faces[face].vi} (${face})` : face
        const Pick = interaction.options.getString('facing')
        const Face = Flip()
        const Title = `<a:LYG_cflip:1090615324551942225> ${vi ? 'Game: Tung xu' : 'Game: Coinflip'}`
        const Picked = `<a:LYG_FubukiWhat:1084085930266218556> ${vi ? `Mặt lựa chọn của ${user}... là mặt: **${Name(Pick)}**` : `${user} picked... **${Name(Pick)}**`}`
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle(Title).setDescription(desc)

        await interaction.editReply({ embeds: [Embed('Yellow', Picked)] })
        await wait(1000)
        await interaction.editReply({ embeds: [Embed('Grey', `<a:LYG_FubukiWhat:1084085930266218556> ${vi ? `Đang tung xu cho ${user}... *(xin chờ một lát...)*` : `Flipping the coin for ${user}... *(please wait...)*`}`)] })
        await wait(2500)

        const Won = (Pick === Face)
        const StandInvolved = (Pick === 'Stand' || Face === 'Stand')
        const Lines = [
            vi ? `**Kết quả tung xu của ${user}:** ${Faces[Face].Emoji} \`[${Name(Face)}]\`` : `**${user}'s coin landed on:** ${Faces[Face].Emoji} \`[${Name(Face)}]\``,
            (Won)
                ? `<:LYG_OkayuYay:1084085932254298122> **${vi ? 'Bạn đã thắng! Chúc mừng bạn!' : 'You won! Congratulations!'}**`
                : `<:LYG_XD:1087375888276000788> **${vi ? 'Bạn đã thua, chúc bạn may mắn lần sau!' : 'You lost, better luck next time!'}**`
        ]
        if (StandInvolved) Lines.push((Won)
            ? `Note: <:LYG_higod:1086172130254798858> **${vi ? 'Thưa ngài, ngài đã vào được coinflip HÀNG HIẾM NHẤT `1/6000` đấy ạ' : 'Sir, you just hit the RAREST coinflip, `1/6000`!'}**`
            : `Note: <:LYG_FubukiSmug:1090619361389191268> **${vi ? 'Bro à, tỉ lệ `1/6000` không dễ ăn đâu nhé!!!' : 'Bro, a `1/6000` chance isn\'t that easy!!!'}**`)

        const Color = (StandInvolved) ? Colors.Stand : (Won) ? Colors.Win : Colors.Lose
        await interaction.editReply({ embeds: [Embed(Color, `${Picked}\n${Lines.map(l => `> ${l}`).join('\n')}`)] })
    }
}
