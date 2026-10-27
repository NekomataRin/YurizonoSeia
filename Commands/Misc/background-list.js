const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js')
const path = require('path')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Level = require('../../Database/Ranking/Leveling')
const UserCards = require('../../Database/Ranking/usercards')
const { RankCards } = require('../../Assets/RankCards')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('background-list')
        .setDescription('Show the server\'s avaiable rank card backgrounds')
        .setDescriptionLocalizations({ vi: "Hiển thị nền rank card hiện có của server" })
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('The page for the rank card')
                .setDescriptionLocalizations({ vi: 'Trang cho cái rank card' })
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(RankCards.length)
        ),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        const Unlocked = (await UserCards.findOne({ UserID: interaction.user.id }).select('-_id Cards').lean())?.Cards || []
        const Equipped = (await Level.findOne({ GuildID: interaction.guild.id, UserID: interaction.user.id }).select('-_id background').lean())?.background

        function Status(i) {
            if (i === 0) return `<:SeiaMuted:1244890584276008970> ${vi ? 'Trạng Thái: \`Có Mặc Định\`' : 'Status: \`Obtained by Default\`'}`
            if (RankCards[i].Key === Equipped) return `<:SeiaSip:1244890166116618340> ${vi ? 'Trạng Thái: \`Đang Sử Dụng\`' : 'Status: \`Currently Equipped\`'}`
            if (Unlocked.includes(RankCards[i].Key)) return `<:seiaheh:1244128244664504392> ${vi ? 'Trạng Thái: \`Đã Nhận\`' : 'Status: \`Obtained\`'}`
            return `<:seiaehem:1244128370669650060> ${vi ? 'Trạng Thái: \`Chưa Nhận\`' : 'Status: \`Not Obtained\`'}`
        }

        const listlen = RankCards.length
        function ListMovingButton(count) {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('5pleft').setEmoji('1247028605775511562').setStyle(ButtonStyle.Secondary).setDisabled(count === 0),
                    new ButtonBuilder().setCustomId('lpage').setEmoji('1086297531379613767').setStyle(ButtonStyle.Secondary).setDisabled(count === 0),
                    new ButtonBuilder().setCustomId('pages').setLabel(`| Page: ${count + 1}/${listlen} |`).setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('rpage').setEmoji('1086297678624854077').setStyle(ButtonStyle.Secondary).setDisabled(count === listlen - 1),
                    new ButtonBuilder().setCustomId('5pright').setEmoji('1247028616609534072').setStyle(ButtonStyle.Secondary).setDisabled(count === listlen - 1)
                )
        }

        function PageMessage(i) {
            const Card = RankCards[i]
            const Collection = Card.Collection || 'Default'
            const Desc = vi
                ? `Danh Sách Rank Card\n> Người Dùng: ${interaction.user}\n> ${Status(i)}\n> Tiêu Đề Card: \`${Card.Title}\`\n> Bộ Sưu Tập: \`${Collection}\``
                : `Rank Cards Collection\n> User: ${interaction.user}\n> ${Status(i)}\n> Card's Title: \`${Card.Title}\`\n> Collection: \`${Collection}\``
            return {
                embeds: [SeiaEmbed(interaction, Card.Color)
                    .setTitle(`[${Card.Emoji}] **Card Key:** \`${Card.Key}\` - \`(Page: ${i + 1})\``)
                    .setDescription(Desc)
                    .setImage(`attachment://${path.basename(Card.Background)}`)],
                components: [ListMovingButton(i)],
                files: [new AttachmentBuilder(Card.Background)],
                attachments: []
            }
        }

        let page = (interaction.options.getInteger('page') || 1) - 1
        const message = await interaction.editReply(PageMessage(page))

        const collector = message.createMessageComponentCollector({ filter: a => a.user.id === interaction.user.id, time: 300000 })
        collector.on('collect', async (a) => {
            switch (a.customId) {
                case 'lpage': page = Math.max(page - 1, 0); break
                case 'rpage': page = Math.min(page + 1, listlen - 1); break
                case '5pleft': page = Math.max(page - 5, 0); break
                case '5pright': page = Math.min(page + 5, listlen - 1); break
            }
            await a.update(PageMessage(page)).catch(() => {})
        })
        collector.on('end', () => interaction.editReply({ components: [] }).catch(() => {}))
    }
}
