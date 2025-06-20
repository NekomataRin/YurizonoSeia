const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const Level = require('../../Database/Ranking/Leveling')
const RankingArr = require('../../Assets/RankCards/rankcardarr')
const UserCards = require('../../Database/Ranking/usercards')
const Language = require('../../Database/lang-setup')

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
                .setMaxValue(RankingArr.length)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        //Language Setup
        let LangKey
        const LanguageKey = await Language.findOne({ UserID: interaction.user.id }).select('-_id Lang')
        if (!LanguageKey) {
            const ResponseEmbed = new EmbedBuilder()
                .setColor("Yellow")
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle(`<:seiaconcerned:1244128341540208793> • **Language Is Not Set**`)
                .setDescription(`<:seiaehem:1244128370669650060> • Sensei! Please use \`/setup-language\` command in order to use the command! Since v1.4.0, my dad updated my code and added Vietnamese language for this!\n-# > And he is too lazy to add proper vietnamese embed for this lmao`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [ResponseEmbed]
            })
        }

        LangKey = LanguageKey.Lang
        const RankKeyName = [], BackgroundList = [], Colors = [], EmojiList = [], CardDesc = []
        for (var i in RankingArr) {
            RankKeyName.push(RankingArr[i][0])
            BackgroundList.push(RankingArr[i][1])
            Colors.push(RankingArr[i][2])
            EmojiList.push(RankingArr[i][4])
            CardDesc.push(RankingArr[i][5])
        }
        const Backgrounds = [], BGSyntax = [], Emoji = [], Status = []
        let UnlockedRankCards = await UserCards.findOne({ UserID: interaction.user.id }).select('-_id Cards')
        let CurrentCard = await Level.findOne({ UserID: interaction.user.id }).select('-_id background')

        let page = interaction.options.getInteger('page') || 1
        for (var i in BackgroundList) {
            Backgrounds.push(new AttachmentBuilder(BackgroundList[i]))
            Emoji.push(EmojiList[i])
            Status.push('<:seiaehem:1244128370669650060> ' + (LangKey === 'vi') ? 'Trạng Thái: \`Chưa Nhận\`' : 'Status: \`Not Obtained\`')
            BGSyntax.push(`attachment://RankCard_${i}.png`)
            for (var j in UnlockedRankCards.Cards) {
                if (RankKeyName[i] === UnlockedRankCards.Cards[j]) {
                    Status[i] = ('<:seiaheh:1244128244664504392> ' + (LangKey === 'vi') ? 'Trạng Thái: \`Đã Nhận\`' : 'Status: `Obtained`')
                    break
                }
            }
        }

        if (RankKeyName.indexOf(CurrentCard.background) !== -1) {
            Status[RankKeyName.indexOf(CurrentCard.background)] = '<:SeiaSip:1244890166116618340>' + (LangKey === 'vi') ? 'Trạng Thái: \`Đang Sử Dụng\`' : 'Status: `Currently Equipped`'
        }
        Status[0] = '<:SeiaMuted:1244890584276008970> ' + (LangKey === 'vi') ? 'Trạng Thái: `Có Mặc Định`' : 'Status: `Obtained by Default`'
        let listlen = RankKeyName.length
        const BackgroundEmbed = [],
            Descs = {
                'vi': `Danh Sách Rank Card\n> Người Dùng: ${interaction.user}\n> ${Status[i]}\n> Tiêu Đề Card: \`${CardDesc[i]}\``,
                'en-US': `Rank Cards Collection\n> User: ${interaction.user}\n> ${Status[i]}\n> Card's Title: \`${CardDesc[i]}\``
            }
        for (var i = 0; i < RankKeyName.length; i++) {
            BackgroundEmbed[i] = new EmbedBuilder()
                .setColor(Colors[i])
                .setTitle(`[${Emoji[i]}] **Card Key:** \`${RankKeyName[i]}\` - \`(Page: ${i + 1})\``)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(Descs[LangKey])
                .setTimestamp()
                .setImage(BGSyntax[i])
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
        }

        function ListMovingButton(count = page) {
            const ListButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('5pleft')
                        .setEmoji('1247028605775511562')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === 0),
                    new ButtonBuilder()
                        .setCustomId('lpage')
                        .setEmoji('1086297531379613767')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === 0),
                    new ButtonBuilder()
                        .setCustomId('pages')
                        .setLabel(`| Page: ${count + 1}/${listlen} |`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('rpage')
                        .setEmoji('1086297678624854077')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === listlen - 1),
                    new ButtonBuilder()
                        .setCustomId('5pright')
                        .setEmoji('1247028616609534072')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(count === listlen - 1)
                )
            return ListButton
        }
        page--

        await interaction.editReply({
            embeds: [BackgroundEmbed[page]],
            components: [ListMovingButton(page)],
            files: [Backgrounds[page]]
        })

        const filter = a => a.user.id === interaction.user.id;
        const message = await interaction.fetchReply()
        const collector = interaction.channel.createMessageComponentCollector({ message, filter, time: 300000 })

        collector.on('collect', async (a) => {
            await a.deferUpdate()
            switch (a.customId) {
                case ('lpage'):
                    {
                        page--
                        await interaction.editReply({
                            embeds: [BackgroundEmbed[page]],
                            components: [ListMovingButton(page)],
                            files: [Backgrounds[page]]
                        })
                        break
                    }
                case ('rpage'):
                    {
                        page++
                        await interaction.editReply({
                            embeds: [BackgroundEmbed[page]],
                            components: [ListMovingButton(page)],
                            files: [Backgrounds[page]]
                        })
                        break
                    }
                case ('5pleft'):
                    {
                        page = (page < 5) ? 0 : page - 5
                        await interaction.editReply({
                            embeds: [BackgroundEmbed[page]],
                            components: [ListMovingButton(page)],
                            files: [Backgrounds[page]]
                        })
                        break
                    }
                case ('5pright'):
                    {
                        page = (page + 5 > listlen - 1) ? listlen - 1 : page + 5
                        await interaction.editReply({
                            embeds: [BackgroundEmbed[page]],
                            components: [ListMovingButton(page)],
                            files: [Backgrounds[page]]
                        })
                        break
                    }
                default: return
            }
        })
    }
}