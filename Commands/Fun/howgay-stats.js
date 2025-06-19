const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')

const Cases = require('../../Assets/Howgay/Texts/allcases')
const HowgayList = require('../../Database/Fun/howgay')
const Language = require('../../Database/lang-setup')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('howgay-stats')
        .setDescription('See the stats of /howgay on User or Server')
        .setDescriptionLocalizations({ vi: "Xem thống kê số lần sử dụng lệnh /howgay lên người dùng hoặc server" }),

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

        const HowGayStats = new EmbedBuilder()
            .setColor('White')
            .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Thống Kê Chỉ Số Gay Của Người Dùng` : `🏳️‍🌈 Checking Gayness Stats Of A User`)
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setDescription((LangKey === 'vi') ? `Hãy chọn người dùng để xem thông kê, hoặc bấm nút [<:HikariREE:1356028568961941636> Skip] để xem thống kê của server` : `Please choose the user you want to check the stats, or press [<:HikariREE:1356028568961941636> Skip] for the server's stats`)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const InputEmbed = await interaction.editReply({
            embeds: [HowGayStats],
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
                .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Thống Kê Chỉ Số Gay Của Người Dùng` : `🏳️‍🌈 Checking Gayness Stats Of A User`)
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
            const HowGayData_Another = await HowgayList.findOne({ GuildId: interaction.guild.id }).select('-_id UserRecords')
            const tuser = await interaction.guild.members.fetch(targetid)

            let responsekey = false, UserObj = {}
            const UserData = HowGayData_Another.UserRecords
            for (var i in UserData) {
                if (UserData[i].id === targetid) {
                    responsekey = true
                    UserObj = UserData[i]
                    break
                }
            }

            const desc = (!responsekey) ?
                {
                    'vi': `<a:SeiaMuted:1336385867136241705> Chà, người dùng này <@${targetid}> hiện không có thống kê (có lẽ cậu ta ở trong danh sách miễn hoặc chưa bao giờ dùng lệnh này, lmao)`,
                    'en-US': `<a:SeiaMuted:1336385867136241705> Well, <@${targetid}> doesn't have any stats for this (maybe they are in the rejection list or have never tested before, lmao)`
                }
                :
                {
                    'vi': `### Người Dùng: <@${targetid}>\n▸ **Tổng Số Lần Kiểm Tra:** \`${UserObj.total.normal + UserObj.total.special}\`\n• **Bình Thường:** \`${UserObj.total.normal}\`\n• **Đặc Biệt:** \`${UserObj.total.special}\`\n\n▸ **Max/Min Trong 100 Lệnh:**\n• **Check Đơn:** (Max: \`${(UserObj.values.run.nonavg.length > 0) ? Number(UserObj.values.max).toFixed(1) : '--'}%\` -- Min: \`${(UserObj.values.run.nonavg.length > 0) ? Number(UserObj.values.min).toFixed(1) : '--'}%\`)\n• **Trung Bình:** (Max: \`${(UserObj.values.run.avg.length > 0) ? Number(UserObj.values.maxavg).toFixed(1) : '--'}%\` -- Min: \`${(UserObj.values.run.avg.length > 0) ? Number(UserObj.values.minavg).toFixed(1) : '--'}%\`)`,
                    'en-US': `### User: <@${targetid}>\n▸ **Total Checking Usage:** \`${UserObj.total.normal + UserObj.total.special}\`\n• **Normal Cases:** \`${UserObj.total.normal}\`\n• **Special Cases:** \`${UserObj.total.special}\`\n\n▸ **Max/Min of The 100 Recent Usages:**\n• **Non-Average:** (Max: \`${(UserObj.values.run.nonavg.length > 0) ? Number(UserObj.values.max).toFixed(1) : '--'}%\` -- Min: \`${(UserObj.values.run.nonavg.length > 0) ? Number(UserObj.values.min).toFixed(1) : '--'}%\`)\n• **Average:** (Max: \`${(UserObj.values.run.avg.length > 0) ? Number(UserObj.values.maxavg).toFixed(1) : '--'}%\` -- Min: \`${(UserObj.values.run.avg.length > 0) ? Number(UserObj.values.minavg).toFixed(1) : '--'}%\`)`
                }

            const ResponseEmbed = new EmbedBuilder()
                .setColor('White')
                .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Thống Kê Chỉ Số Gay Của Người Dùng` : `🏳️‍🌈 Checking Gayness Stats Of A User`)
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
            const HowgayData = await HowgayList.findOne({ GuildId: interaction.guild.id }).select('-_id TypeRecords')
            if (HowgayData.TypeRecords.length === 0) {
                const HowGayStat_Server = new EmbedBuilder()
                    .setColor('White')
                    .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Thống Kê Chỉ Số Gay Của Cả Server` : `🏳️‍🌈 Checking Gayness Stats Of Server`)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setDescription((LangKey === 'vi') ? `<a:SeiaMuted:1336385867136241705> Chà, server **${interaction.guild.name}** chưa có dữ liệu thống kê... xin hãy thử lại sau.` : `<a:SeiaMuted:1336385867136241705> Well, server **${interaction.guild.name}** doesn't have actual data for this... please try again later.`)
                    .setTimestamp(Date.now())
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                return interaction.editReply({
                    embeds: [HowGayStat_Server],
                    components: []
                })
            }

            const NormalTypes = HowgayData.TypeRecords[0], SpecialCases = HowgayData.TypeRecords[1]
            let SNormal = 0, SSpecial = 0, STotal = 0
            for (var i in Object.keys(NormalTypes)) {
                SNormal += Number(NormalTypes[i].value)
            }
            for (var i in Object.keys(SpecialCases)) {
                let Key = Object.keys(SpecialCases)[i]
                SSpecial += Number(SpecialCases[Key])
            }
            STotal += (SNormal + SSpecial)
            let desc = (LangKey === 'vi') ? `## Server: ${interaction.guild.name}\n## **Tổng Số:** \`[${STotal}]\`\n### **Bình Thường:** \`[${SNormal}]\`\n` : `## Server: ${interaction.guild.name}\n## **Total Usages:** \`[${STotal}]\`\n### **Normal Cases:** \`[${SNormal}]\`\n`
            desc += `▸ ${Cases.EmojisNormal[0]} \`${NormalTypes[0].name}\` **(0.0% - 1.0%)**: **\`[${NormalTypes[0].value}]\`**\n`
            const Keys = Object.keys(NormalTypes)
            for (var i = 1; i < Keys.length - 1; i++) {
                desc += `▸ ${Cases.EmojisNormal[i]} \`${NormalTypes[i].name}\` **(${Number(Cases.Ranges.NormalCases[i - 1]).toFixed(1)}% - ${Number(Number(Cases.Ranges.NormalCases[i]) - 0.1).toFixed(1)}%)**: **\`[${NormalTypes[i].value}]\`**\n`
            }
            desc += `▸ ${Cases.EmojisNormal[7]} \`${NormalTypes[7].name}\` **(100.0% - 101.0%)**: **\`[${NormalTypes[7].value}]\`**\n`

            desc += (LangKey === 'vi') ? `\n### **Đặc Biệt:** \`[${SSpecial}]\`\n` : `\n### **Special Cases:** \`[${SSpecial}]\`\n`
            const keys = Object.keys(SpecialCases)
            for (var i in keys) {
                let key = `Case${keys[i]}`
                desc += `▸ ${Cases.SpecialCases[key].emoji} \`${Cases.SpecialCases[key].name}\` **(${keys[i]}%)**: **\`[${SpecialCases[keys[i]]}]\`**\n`
            }

            const HowGayStat_Server = new EmbedBuilder()
                .setColor('White')
                .setTitle((LangKey === 'vi') ? `🏳️‍🌈 Thống Kê Chỉ Số Gay Của Cả Server` : `🏳️‍🌈 Checking Gayness Stats Of Server`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(desc)
                .setTimestamp(Date.now())
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            await interaction.editReply({
                embeds: [HowGayStat_Server],
                components: []
            })
        }
    }
}