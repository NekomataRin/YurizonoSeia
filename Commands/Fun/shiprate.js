const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')
const { Tiers, Comments } = require('../../Assets/Shiprate/comments')

const Pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const Genders = {
    male: { Emoji: '<:Wanderer_Heh:1059112869020586004>', EmojiId: '1059112869020586004', vi: 'Nam', en: 'Male' },
    female: { Emoji: '<:MikaNya:1416618271767265350>', EmojiId: '1416618271767265350', vi: 'Nữ', en: 'Female' }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shiprate')
        .setDescription('How well do 2 people match? (with their assumed genders)')
        .setDescriptionLocalizations({ vi: 'Xác định tỉ lệ hợp đôi giữa 2 người (và giới tính giả sử nhá)' })
        .addUserOption(option =>
            option.setName('user1')
                .setDescription('The first person')
                .setDescriptionLocalizations({ vi: 'Người thứ nhất' })
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user2')
                .setDescription('The second person')
                .setDescriptionLocalizations({ vi: 'Người thứ hai' })
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        const user1 = interaction.options.getUser('user1')
        const user2 = interaction.options.getUser('user2')
        const Title = `<:KayokoThinking:1262268455499862036> **${vi ? 'Kiểm tra mối quan hệ của hai người dùng nào đó...' : 'Checking the relationship of two users...'}**`
        const Note = vi ? '**Lưu ý:** Lệnh chỉ để cho vui, không có ý tứ nào nhá' : '**Note:** Just for fun, no hidden meaning!'
        const Embed = (color, desc) => SeiaEmbed(interaction, color).setTitle(Title).setDescription(`${desc}\n\n${Note}`)

        if (user1.id === user2.id) {
            return interaction.editReply({ embeds: [Embed('Red', vi ? `Bạn đi kiểm tra mối quan hệ giữa ${user1} và ${user2} sao? Thôi bỏ đi một người mà :V` : `Checking the relationship between ${user1} and ${user2}? Come on, pick two different people :V`)] })
        }
        if (await OnCooldown(interaction, 'Shiprate', LangKey, 45000)) return

        //Step 1: the user picks the (assumed) gender of each person with the buttons
        const Unknown = vi ? '*(Chưa xác định)*' : '*(Unknown)*'
        const Gender = (key) => (key) ? `*(${Genders[key].Emoji} ${Genders[key][vi ? 'vi' : 'en']})*` : Unknown
        const Ask = (keys, done = false) => Embed('White', `<a:LYG_TighnariNotes:1090126010571300874> ${(done) ? (vi ? 'Hệ thống đã thu thập xong thông tin!' : 'Got everything I need!') : (vi ? 'Hệ thống cần một chút thông tin về người dùng' : 'I need a bit of info about them')}\n\n> **${vi ? 'Người thứ nhất' : 'First person'}:** ${user1} ${Gender(keys[0])}\n> **${vi ? 'Người thứ hai' : 'Second person'}:** ${user2} ${Gender(keys[1])}`)
        const Buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('male').setLabel(vi ? 'GT: Nam' : 'Male').setEmoji(Genders.male.EmojiId).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('female').setLabel(vi ? 'GT: Nữ' : 'Female').setEmoji(Genders.female.EmojiId).setStyle(ButtonStyle.Secondary)
        )

        const message = await interaction.editReply({ embeds: [Ask([])], components: [Buttons] })
        const keys = []
        while (keys.length < 2) {
            const click = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 5 * 60 * 1000 }).catch(() => null)
            if (!click) return interaction.editReply({ components: [] }).catch(() => {})
            keys.push(click.customId)
            await click.update({ embeds: [Ask(keys, keys.length === 2)], components: (keys.length < 2) ? [Buttons] : [] })
        }

        //Step 2: calculating... then the result (0.0% → 101.0%)
        await wait(1000)
        const People = `> ${user1} ${Gender(keys[0])}\n> ${user2} ${Gender(keys[1])}`
        await interaction.editReply({ embeds: [Embed('White', `<:mikaeat:1254109782592327783> ${vi ? 'Hệ thống đang tính toán mức độ hợp nhau giữa hai người' : 'Calculating how well these two match'}\n\n${People}\n\n> <a:LYG_Slot:900776450137935872> ${vi ? 'Xin vui lòng chờ một lát...' : 'Please wait a moment...'}`)] })
        await wait(2000)

        const Rate = Math.floor(Math.random() * 1011) / 10
        const t = Tiers.findIndex(tier => Rate <= tier.Max)
        const Comment = `${Tiers[t].Emoji} • ${Pick(Comments[LangKey][t])}`
        await interaction.editReply({ embeds: [Embed(Tiers[t].Color, `<:KikyouWink:1415972415204491405> ${vi ? 'Đã tính toán xong!' : 'Done!'}\n\n${People}\n\n> ${vi ? 'Độ hợp nhau của hai người là' : 'Their match rate is'}: **${Rate.toFixed(1)}%**\n\n> **${vi ? 'Nhận xét' : 'Comment'}:** ${Comment}`)] })
    }
}
