const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

const Omikuji = require('../../Database/Fun/omikuji')
const Language = require('../../Database/lang-setup')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('omikuji-stats')
        .setDescription('Show the stats of the user\'s daily omikuji usage, or server')
        .setDescriptionLocalizations({ vi: 'Thống kê số lần sử dụng lệnh /omikuji mỗi ngày của người dùng, hoặc là cả server' }),

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

        const Selector = new UserSelectMenuBuilder()
            .setCustomId('user-selector')
            .setPlaceholder((LangKey === 'vi') ? 'Hãy Chọn Người Dùng' : 'Please Choose A User')
            .setMinValues(1)
            .setMaxValues(1)

        const SkipButton = new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('[Skip]')
            .setEmoji('1356028568961941636')
            .setStyle(ButtonStyle.Secondary)

        const UserRow = new ActionRowBuilder()
            .addComponents(Selector)

        const SkipRow = new ActionRowBuilder()
            .addComponents(SkipButton)

        const OmiStats = new EmbedBuilder()
            .setColor('White')
            .setTitle((LangKey === 'vi') ? `🎋 Thống Kê Lượt Dùng Omikuji Của Người Dùng` : `🎋 Checking Omikuji Stats Of A User`)
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setDescription((LangKey === 'vi') ? `Hãy chọn người dùng để xem thông kê, hoặc bấm nút [<:HikariREE:1356028568961941636> Skip] để xem thống kê của server` : `Please choose the user you want to check the stats, or press [<:HikariREE:1356028568961941636> Skip] for the server's stats`)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const InputEmbed = await interaction.editReply({
            embeds: [OmiStats],
            components: [UserRow, SkipRow]
        })

        let runkey = 0, targetid
        const collectorFilter = i => i.user.id = interaction.user.id
        const confirm = await InputEmbed.awaitMessageComponent({ filter: collectorFilter, time: 30000, errors: ['time'] })
        if (confirm.customId === 'user-selector') {
            runkey = 1
            targetid = confirm.values[0]
            const WaitEmbed = new EmbedBuilder()
                .setColor('White')
                .setTitle((LangKey === 'vi') ? `🎋 Thống Kê Lượt Dùng Omikuji Của Người Dùng` : `🎋 Checking Omikuji Stats Of A User`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription((LangKey === 'vi') ? `Xin hãy chờ để tớ load thống kê của <@${targetid}>...` : `Please wait for the stats of <@${targetid}>...`)
                .setTimestamp(Date.now())
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [WaitEmbed],
                components: []
            })
        } else if (confirm.customId === 'skip') {
            runkey = 2
        } else {
            const ErrEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Err - Timed Out`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription((LangKey === 'vi') ? `Anh bạn à, cậu không chọn gì à, làm ơn thử lại đi!` : `Bro, you forget to choose anything, please try again!`)
                .setTimestamp(Date.now())
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [ErrEmbed],
                components: []
            })
        }

        if (runkey === 1) {
            const Omikuji_Another = await Omikuji.findOne({ GuildId: interaction.guild.id }).select('-_id UserRecords')
            const tuser = await interaction.guild.members.fetch(targetid)

            let responsekey = false, UserObj = {}
            const UserData = Omikuji_Another.UserRecords

            for (var i in UserData) {
                if (UserData[i].UserID === targetid) {
                    responsekey = true
                    UserObj = UserData[i]
                    break
                }
            }

            let total = 0
            if (responsekey) {
                const SSArr = UserObj['SS-Tier']
                for (var i in Object.keys(UserObj)) {
                    let Key = Object.keys(UserObj)[i]

                    if (Key !== 'SS-Tier' && Key !== 'UserID') {
                        total += UserObj[Key]
                    }
                }
                for (var i in Object.keys(SSArr)) {
                    total += SSArr[i]
                }

            }
            const desc = (!responsekey) ? {
                "vi": `<a:SeiaMuted:1336385867136241705> Chà, <@${targetid}> không hề có thống kê luôn á, đồng nghĩa họ chưa bao giờ test nhân phẩm mỗi ngày cả... `,
                "en-US": `<a:SeiaMuted:1336385867136241705> Well, <@${targetid}> doesn't have any stats for this, which means they have never test their daily luck, after all...`
            } : {
                "vi": `### Người Dùng: <@${targetid}>\n▸ **Tổng số lần dùng:** \`${total}\`\n• **C-Tier:** \`${UserObj['C-Tier']}\`\n• **B-Tier:** \`${UserObj['B-Tier']}\`\n• **A-Tier:** \`${UserObj['A-Tier']}\`\n• **S-Tier:** \`${UserObj['S-Tier']}\`\n• **SS-Tier:**\n> ▸ **Youko:** \`${UserObj['SS-Tier'][0]}\`\n> ▸ **Nakao:** \`${UserObj['SS-Tier'][1]}\`\n> ▸ **Rin:** \`${UserObj['SS-Tier'][2]}\`\n• **EX-Tier:** \`${UserObj['EX-Tier']}\``,
                "en-US": `### User: <@${targetid}>\n▸ **Total Checking Usage:** \`${total}\`\n• **C-Tier:** \`${UserObj['C-Tier']}\`\n• **B-Tier:** \`${UserObj['B-Tier']}\`\n• **A-Tier:** \`${UserObj['A-Tier']}\`\n• **S-Tier:** \`${UserObj['S-Tier']}\`\n• **SS-Tier:**\n> ▸ **Youko:** \`${UserObj['SS-Tier'][0]}\`\n> ▸ **Nakao:** \`${UserObj['SS-Tier'][1]}\`\n> ▸ **Rin:** \`${UserObj['SS-Tier'][2]}\`\n• **EX-Tier:** \`${UserObj['EX-Tier']}\``
            }

            const ResponseEmbed = new EmbedBuilder()
                .setColor('White')
                .setTitle((LangKey === 'vi') ? `🎋 Thống Kê Lượt Dùng Omikuji Của Người Dùng` : `🎋 Checking Omikuji Stats Of A User`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(desc[LangKey])
                .setTimestamp(Date.now())
                .setThumbnail(tuser.displayAvatarURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [ResponseEmbed],
            })
        }

        if (runkey === 2) {
            const OmikujiData = await Omikuji.findOne({ GuildId: interaction.guild.id }).select('-_id TypeRecords')
            if (OmikujiData.TypeRecords.length === 0) {
                const OmiServer = new EmbedBuilder()
                    .setColor('White')
                    .setTitle((LangKey === 'vi') ? `🎋 Thống Kê Lượt Dùng Omikuji Của Toàn Server` : `🎋 Checking Omikuji Stats Of Server`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription((LangKey === 'vi') ? `<a:SeiaMuted:1336385867136241705> Chà, server **${interaction.guild.name}** chưa có dữ liệu thống kê... xin hãy thử lại sau.` : `<a:SeiaMuted:1336385867136241705> Well, server **${interaction.guild.name}** doesn't have actual data for this... please try again later.`)
                    .setTimestamp(Date.now())
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                return interaction.editReply({
                    embeds: [OmiServer],
                    components: []
                })
            }

            let total = 0
            const SSArr = OmikujiData.TypeRecords[0]['SS-Tier']
            for (var i in Object.keys(OmikujiData.TypeRecords[0])) {
                let Key = Object.keys(OmikujiData.TypeRecords[0])[i]

                if (Key !== 'SS-Tier') {
                    total += OmikujiData.TypeRecords[0][Key]
                }
            }
            for (var i in Object.keys(SSArr)) {
                total += SSArr[i]
            }

            const desc = {
                "vi": `### Server: \`${interaction.guild.name}\`\n▸ **Tổng Lượt Dùng Lệnh:** \`${total}\`\n• **C-Tier:** \`${OmikujiData.TypeRecords[0]['C-Tier']}\`\n• **B-Tier:** \`${OmikujiData.TypeRecords[0]['B-Tier']}\`\n• **A-Tier:** \`${OmikujiData.TypeRecords[0]['A-Tier']}\`\n• **S-Tier:** \`${OmikujiData.TypeRecords[0]['S-Tier']}\`\n• **SS-Tier:**\n> ▸ **Youko:** \`${OmikujiData.TypeRecords[0]['SS-Tier'][0]}\`\n> ▸ **Nakao:** \`${OmikujiData.TypeRecords[0]['SS-Tier'][1]}\`\n> ▸ **Rin:** \`${OmikujiData.TypeRecords[0]['SS-Tier'][2]}\`\n• **EX-Tier:** \`${OmikujiData.TypeRecords[0]['EX-Tier']}\``,
                "en-US": `### Server: \`${interaction.guild.name}\`\n▸ **Total Checking Usage:** \`${total}\`\n• **C-Tier:** \`${OmikujiData.TypeRecords[0]['C-Tier']}\`\n• **B-Tier:** \`${OmikujiData.TypeRecords[0]['B-Tier']}\`\n• **A-Tier:** \`${OmikujiData.TypeRecords[0]['A-Tier']}\`\n• **S-Tier:** \`${OmikujiData.TypeRecords[0]['S-Tier']}\`\n• **SS-Tier:**\n> ▸ **Youko:** \`${OmikujiData.TypeRecords[0]['SS-Tier'][0]}\`\n> ▸ **Nakao:** \`${OmikujiData.TypeRecords[0]['SS-Tier'][1]}\`\n> ▸ **Rin:** \`${OmikujiData.TypeRecords[0]['SS-Tier'][2]}\`\n• **EX-Tier:** \`${OmikujiData.TypeRecords[0]['EX-Tier']}\``
            }
            const OmiStat_Server = new EmbedBuilder()
                .setColor('White')
                .setTitle((LangKey === 'vi') ? `🎋 Thống Kê Lượt Dùng Omikuji Của Toàn Server` : `🎋 Checking Omikuji Stats Of Server`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(desc)
                .setTimestamp(Date.now())
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [OmiStat_Server],
                components: []
            })
        }
    }
}