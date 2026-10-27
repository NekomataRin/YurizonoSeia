const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')
const path = require('path')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed, AvatarOf } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown } = require('../../Utils/cooldown')
const Config = require('../../Utils/config')
const Log = require('../../Utils/logger')

const HowgayConfig = require('../../Assets/Howgay/config')
const SpecialCases = require('../../Assets/Howgay/special-cases')
const Rejected = require('../../Assets/Howgay/rejected')
const Comments = { 'en-US': require('../../Assets/Howgay/Texts/allcases'), 'vi': require('../../Assets/Howgay/Texts/allcases-vn') }
const { RollTicks, AverageTicks, FormatTicks, SpecialDbKey, Evaluate } = require('../../Functions/Fun/howgay')
const { HowgayUser, HowgayGuild } = require('../../Database/Fun/howgay')

const Pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Image + its attachment:// link for an embed
function Image(file) {
    return { file: new AttachmentBuilder(file), ctx: `attachment://${path.basename(file)}` }
}

// Text added under the result about the Gay / Giga Chad roles (main server only)
function RoleNote(LangKey, result, tuser, target) {
    const { Gay, GigaChad } = Config.Roles
    const vi = (LangKey === 'vi')
    if (result.value <= HowgayConfig.ChadMax) {
        if (tuser.roles.cache.has(Gay)) return { remove: Gay, note: vi ? `\n-# > Đã gỡ <@&${Gay}> cho ${target}, well, vì chính bản thân họ đã chứng minh họ là con người chính hiệu.` : `\n-# > Successfully removed <@&${Gay}> to ${target}, well then, since they proved themselves to be a real person.` }
        if (!tuser.roles.cache.has(GigaChad)) return { add: GigaChad, note: vi ? `\n-# > Đã thêm <@&${GigaChad}> cho ${target}. Chúc mừng anh bạn nhá, giờ đã là GIGA CHAD rôi đấy!` : `\n-# > Successfully added <@&${GigaChad}> to ${target}. Congratulations, you're the real chad here!` }
        return { note: vi ? `\n-# Anh bạn à, kĩ năng rizz của ngài cao quá so với chúng sinh rồi, chả lẽ phải gọi ngài là TERACHAD?` : `\n-# Bro, your rizz level is too high for us now, what do we call, a TERACHAD?` }
    }
    if (result.value >= HowgayConfig.GayMin) {
        if (tuser.roles.cache.has(GigaChad)) return { remove: GigaChad, note: vi ? `\n-# > Đã gỡ <@&${GigaChad}> cho ${target}, well tệ đấy, anh bạn mất đi danh hiệu rồi còn dâu, lol.` : `\n-# > Successfully removed <@&${GigaChad}> to ${target}, well too bad, bro lost your title lol.` }
        if (!tuser.roles.cache.has(Gay)) return { add: Gay, note: vi ? `\n-# > Đã thêm <@&${Gay}> cho ${target}. Chúc mừng, giờ thì mọi anh em trong làng biết là bạn bị GAY` : `\n-# > Successfully added <@&${Gay}> to ${target}. Congratulations, now everyone knows that you are GAY` }
        return { note: vi ? `\n-# Lmao, Bạn đã gay rồi, giờ lại còn nhận cái chỉ số này nữa, thật đáng xấu hổ mà.` : `\n-# Lmao, you're already gay, and now you got this value again, what a pity.` }
    }
    return null
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('howgay')
        .setDescription('Checking a user is gay or not in the server')
        .setDescriptionLocalizations({
            vi: "Kiểm tra người dùng nào đó có bị gay hay không trong server"
        })
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to check')
                .setDescriptionLocalizations({ vi: 'Người dùng mà bạn muốn kiểm tra' })
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('avg')
                .setDescription('Check average on how gay (3 times), this is optional')
                .setDescriptionLocalizations({ vi: "Kiểm tra độ gay trung bình (3 lần), cái này tuỳ chọn" })
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const cdtime = 20000

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        const target = interaction.options.getUser('user') || interaction.user
        const tuser = await interaction.guild.members.fetch(target.id).catch(() => null)
        const AvgChr = interaction.options.getBoolean('avg') || false
        const Title = vi ? `🏳️‍🌈 Kiểm tra độ gay của ai đó` : `🏳️‍🌈 Checking gayness of a user`
        const Thumbnail = AvatarOf(tuser || target)

        //Rejected users + bots (Seia has her own line in Rejected)
        let Denied = null
        if (Rejected[target.id]) {
            Denied = { desc: Rejected[target.id].desc[LangKey], img: HowgayConfig.Images.Rejected(Rejected[target.id].img) }
        } else if (target.bot && target.id !== Config.BotID) {
            Denied = {
                desc: vi ? `<a:YaeSlap:1251733720600412240> Oi, bạn không thể dùng lệnh \`/howgay\` lên bot! (${target}), làm ơn hãy check người khác đi!` : `<a:YaeSlap:1251733720600412240> Oi, you can't check \`/howgay\` command on a bot! (${target}), please go check someone else!`,
                img: HowgayConfig.Images.Bot
            }
        }
        if (Denied) {
            const { file, ctx } = Image(Denied.img)
            const DeniedEmbed = SeiaEmbed(interaction, HowgayConfig.Colors.Rejected)
                .setTitle(Title)
                .setThumbnail(Thumbnail)
                .setDescription(Denied.desc)
                .setImage(ctx)
            return interaction.editReply({ embeds: [DeniedEmbed], files: [file] })
        }

        if (await OnCooldown(interaction, 'HowGay', LangKey, cdtime)) return

        //Roll: 1 time, or AvgRolls times and take the average
        const Rolls = Array.from({ length: (AvgChr) ? HowgayConfig.AvgRolls : 1 }, RollTicks)
        const result = Evaluate((AvgChr) ? AverageTicks(Rolls) : Rolls[0])

        let Color, Emoji, Comment, ImgFile
        if (result.special) {
            const Special = SpecialCases[result.special]
            Color = HowgayConfig.Colors.SpecialCases
            Emoji = Special.emoji
            Comment = Special.desc[LangKey]
            ImgFile = HowgayConfig.Images.Special(Special.img)
        } else {
            const Normal = HowgayConfig.NormalCases[result.tier]
            Color = Normal.Color
            Emoji = Normal.Emoji
            Comment = Pick(Comments[LangKey][`Case-${result.tier}`])
            ImgFile = HowgayConfig.Images.Default
        }
        if (result.value <= HowgayConfig.ChadMax) ImgFile = Pick(HowgayConfig.Images.GigaChad)
        if (result.value >= HowgayConfig.GayMin) ImgFile = Pick(HowgayConfig.Images.Gay)

        const ResultArr = {
            "vi": ["Kết Quả Kiểm Tra Độ Gay", (AvgChr) ? "Độ gay sau khi tính toán của" : "Độ gay của", "là", "Nhận xét:", "Chỉ Số Gay:", "Chỉ Số Giga Chad:"],
            "en-US": ["Gayness Test Result", (AvgChr) ? "The calculated gayness of" : "The gayness of", "is", "Comments:", "Gay Factor:", "Giga Chad Factor:"]
        }[LangKey]

        const Role = (interaction.guild.id === process.env.GUILD_ID && tuser) ? RoleNote(LangKey, result, tuser, target) : null
        const ResultDesc = `## ${Emoji} - ${ResultArr[0]}\n▸ ${ResultArr[1]} ${target} ${ResultArr[2]} \`${result.text}%\`\n▸ ${ResultArr[4]} \`${result.GayFactor}\`\n▸ ${ResultArr[5]} \`${result.ChadFactor}\`\n### > ${ResultArr[3]}\n\n ${Comment}${Role?.note || ''}`

        const GayEmbed = (desc, color = 'White') => SeiaEmbed(interaction, color)
            .setTitle(Title)
            .setThumbnail(Thumbnail)
            .setDescription(desc)

        //Waiting...
        await interaction.editReply({
            embeds: [GayEmbed(vi ? `<:SeiaSip:1244890166116618340> Hệ thống đang kiểm tra độ gay của ${target}... Xin vui lòng chờ...` : `<:SeiaSip:1244890166116618340> The system is checking the gayness of ${target}... Please wait...`)]
        })
        await wait(2000)

        //Avg: show every roll one by one first
        let AttemptsDesc = ''
        if (AvgChr) {
            for (let i = 0; i < Rolls.length; i++) {
                AttemptsDesc += vi ? `▸ **Lần ${i + 1}:** Chỉ số gay của ${target} là \`${FormatTicks(Rolls[i])}%\`\n` : `▸ **Attempt ${i + 1}:** The gayness of ${target} is \`${FormatTicks(Rolls[i])}%\`\n`
                await wait(500)
                await interaction.editReply({ embeds: [GayEmbed(AttemptsDesc)] })
            }
            await wait(500)
        }

        const { file, ctx } = Image(ImgFile)
        await interaction.editReply({
            embeds: [GayEmbed(AttemptsDesc + ResultDesc, Color).setImage(ctx)],
            files: [file]
        })

        //Roles (main server only)
        if (Role?.add) await tuser.roles.add(Role.add).catch(err => Log.Error('Howgay - cannot add role:', err.message))
        if (Role?.remove) await tuser.roles.remove(Role.remove).catch(err => Log.Error('Howgay - cannot remove role:', err.message))

        //Stats: 1 doc per checked user + 1 doc per server, no hard-coded keys
        const GuildID = interaction.guild.id
        await HowgayUser.updateOne(
            { GuildID, UserID: target.id },
            {
                $inc: { Total: 1, Special: (result.special) ? 1 : 0 },
                $push: { [(AvgChr) ? 'Average' : 'Single']: { $each: [result.value], $position: 0, $slice: HowgayConfig.KeepRecent } }
            },
            { upsert: true }
        )
        const GuildInc = { [`Normal.${result.tier}`]: 1 }
        if (result.special) GuildInc[`Special.${SpecialDbKey(result.special)}`] = 1
        await HowgayGuild.updateOne({ GuildID }, { $inc: GuildInc }, { upsert: true })
    }
}
