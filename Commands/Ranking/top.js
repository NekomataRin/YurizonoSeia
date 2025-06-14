const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const chalk = require('chalk')

const Level = require('../../Database/Ranking/Leveling')
const cdSchema = require('../../Database/cooldown')
const LevelCalc = require('../../Utils/Ranking/lvlcalc')
const RankingArr = require('../../Assets/RankCards/rankcardarr')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Show the leaderboard of the community')
        .addNumberOption(option =>
            option.setName('page')
                .setDescription('The page you want to see from leaderboard')
                .setMinValue(1)
                .setRequired(false)),
    async execute(interaction) {

        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const Page = interaction.options.getNumber('page') || 1
        const cdtime = 30000

        let AllLevels = await Level.find({ GuildID: interaction.guild.id }).select('-_id UserID exp level total background restrict')
        AllLevels.sort((a, b) => {
            if (Number(a.total) < Number(b.total)) return 1
            if (Number(a.total) > Number(b.total)) return -1
            return 0
        })

        const EmojiList = [],
            KeyList = [],
            Emoji = [],
            TopList = []

        for(var i in RankingArr) {
            EmojiList.push(RankingArr[i][4])
            KeyList.push(RankingArr[i][0])
        }
        
        for (var i in AllLevels) {
            const UserKey = AllLevels[i].background
            Emoji[i] = EmojiList[0]
            if (UserKey === 'none') {
                Emoji[i] = EmojiList[0]
                continue
            }
            for (var j in KeyList) {
                if (UserKey === KeyList[j]) {
                    Emoji[i] = EmojiList[j]
                    break
                }
            }
        }

        for (var i = 0; i < AllLevels.length; i++) {
            let ReqExp = LevelCalc(AllLevels[i].level)
            
            const ProgressNum = AllLevels[i].exp / ReqExp * 100
            const Progress = `${ProgressNum.toFixed(2)}%`
            const ProgressTxt = `[${Progress}] ${AllLevels[i].exp}/${ReqExp}`
            let UserProg = `### • [${Emoji[i]}] **__Rank:__** #${i + 1}\n• **__User:__** <@${AllLevels[i].UserID}> • **__Total PP:__** ${AllLevels[i].total}\n• **__Level:__** ${AllLevels[i].level} • **__Progress:__** ${ProgressTxt}\n`
            if(['Code-1', 'Code-2', 'Code-3'].includes(AllLevels[i].restrict)) UserProg = `### • [${Emoji[i]}] **__Rank:__** #${i + 1}\n• **__User:__** <@${AllLevels[i].UserID}> • **__Total PP:__** ${AllLevels[i].total}\n• **__Level:__** ${AllLevels[i].level} • **__Progress:__** ${ProgressTxt}\n-# Note: This User Has Been Restricted (Restrict Code: [${AllLevels[i].restrict}])\n`
            TopList.push(UserProg)

        }

        const PageUpLim = (Page * 10)
        const PageDownLim = (Page * 10) - 10
        const ResultList = TopList.slice(PageDownLim, PageUpLim)

        var Desc = ''
        for (var j = 0; j < ResultList.length; j++) {
            let m = ResultList[j]
            Desc += m
        }
        if (Desc === '') {
            Desc += '<:seiaconcerned:1244128341540208793> Hmm... looks like this page\'s so empty right now... Maybe time will tell the answer?'
        } 
        if (ResultList.length === 10) {
            Desc += `\n\n<:seiaheh:1244128244664504392> Use command \`/top page:${Page + 1}\` to see page ${Page + 1}, if you liked please!`
        } else if(Desc !== '') {
            Desc +=`\n\n<:seiaehem:1244129111169826829> Alright, this is the end of the list... Only time will tell for the future of the leaderboard...`
        }

        const TopEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle(`**Server Leaderboard** - \`(Page: ${Page})\``)
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setDescription(Desc)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        cdSchema.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                cdSchema.create({
                    UserID: interaction.user.id,
                    Top: Date.now()
                })
                await interaction.editReply('<:seiaconcerned:1244128341540208793> Well, since you haven\'t in cooldown database yet... now you can try again')
            } else {
                const cduser = data.UserID
                const CDTime = data.Top
                console.log(chalk.yellow('[Command: Top]') + ` ${cduser}, ${CDTime}, ${Date.now()}`)

                if (CDTime > Date.now()) {
                    const cdembed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`**Command - Cooldown**`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(` <:seiaconcerned:1244128341540208793> | ${interaction.user} Sensei! Can you please stop doing that command again? I'm exhausted, I can take a rest too, you know? I'm not some sort of a real robot who can repeatedly do this for you!\n-# You can use this command again in: <t:${Math.floor(CDTime/1000)}:R>`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({ embeds: [cdembed] })
                } else {
                    data.Top = Date.now() + cdtime
                    data.save()
                    await interaction.editReply({
                        embeds: [TopEmbed]
                    })
                }
            }
        })
    }
}