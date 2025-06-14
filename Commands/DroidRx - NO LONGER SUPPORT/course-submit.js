const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const DrxUsers = require('../../Database/DroidRx/drxuserdata')
const { request } = require('undici')
const FooterEmbeds = require('../../Utils/embed')
const DanCourseList = require('../../Assets/DroidRx/Texts/dan_object')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('course-submit')
        .setDescription('Submit your Dan Course score to claim the role')
        .addStringOption(option =>
            option.setName('course')
                .setDescription('The course you wanted to submit')
                .addChoices(
                    {
                        name: '1st Dan - A New Light Soaring from the Celestial',
                        value: '1dan'
                    },
                    {
                        name: '2nd Dan - The First Melody to the World',
                        value: '2dan'
                    },
                    {
                        name: '3rd Dan - A Melodic Horizon',
                        value: '3dan'
                    },
                    {
                        name: '4th Dan - Breeze Wind of Melody',
                        value: '4dan'
                    },
                    {
                        name: '5th Dan - Summit of Guidance',
                        value: '5dan'
                    },
                    {
                        name: '6th Dan - Field of Historia',
                        value: '6dan'
                    },
                    {
                        name: '7th Dan - Fall into the Abyss',
                        value: '7dan'
                    },
                    {
                        name: '8th Dan - Despair and Lost Hope',
                        value: '8dan'
                    },
                    {
                        name: '9th Dan - The Endless Conflict',
                        value: '9dan'
                    },
                    {
                        name: '10th Dan - The Pseudo-Ending Destination',
                        value: '10dan'
                    },
                    {
                        name: '11th Dan - Echo of the Modern Past',
                        value: '11dan'
                    },
                    {
                        name: '12th Dan - Trial of Tempest',
                        value: '12dan'
                    },
                    {
                        name: '13th Dan - Beyond the Anomaly',
                        value: '13dan'
                    },
                    {
                        name: 'EX Dan - The Absolute End',
                        value: 'exdan'
                    },
                    {
                        name: '14th Dan - The Decay of Space and Time',
                        value: '14dan'
                    },
                    {
                        name: '15th Dan - Seeker of The New Irruption',
                        value: '15dan'
                    },
                )
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const DanKey = interaction.options.getString('course')

        return interaction.editReply('This command is NO LONGER Supported, Sorry!')
        let UserID
        const GetID = await DrxUsers.findOne({ DiscordID: interaction.user.id })
        if (!GetID) {
            const InvalidID = new EmbedBuilder()
                .setColor('DarkButNotBlack')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Error: Invalid User ID')
                .setDescription(`<:seiaehem:1244129111169826829> • You must bind your account to use this command, please contact one of the devs do that for you!`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidID]
            })
        } else {
            UserID = GetID.UserID
        }

        const a = await request(`https://v4rx.me/api/get_user/?id=${UserID}`)
        const ProfileResult = await a.body.json()

        let DanKeyCheck = false, ReqID, DanName, DanMods, RoleID, ReqAcc
        for (var i in Object.keys(DanCourseList)) {
            if (DanKey === DanCourseList[Object.keys(DanCourseList)[i]].value) {
                ReqID = DanCourseList[Object.keys(DanCourseList)[i]].map_id
                DanMods = DanCourseList[Object.keys(DanCourseList)[i]].mods
                RoleID = DanCourseList[Object.keys(DanCourseList)[i]].role_id
                ReqAcc = DanCourseList[Object.keys(DanCourseList)[i]].req
                DanName = `${Object.keys(DanCourseList)[i]} - ${DanCourseList[Object.keys(DanCourseList)[i]].name}`
                break
            }
        }

        const Pending = new EmbedBuilder()
            .setColor('DarkButNotBlack')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Dan Course Submission')
            .setDescription(`<:seiaehem:1244129111169826829> • It might take a while for you to get the score of the course... Please wait\n> ${DanName} - Submit Status: \`Pending\`\n-# Note: It might crash, lmao`)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
        await interaction.editReply({
            embeds: [Pending]
        })

        let PlayResult, ScoreList = []
        const PlayLimit = ProfileResult.stats.plays 
        const b = await request(`https://v4rx.me/api/get_scores/?limit=${PlayLimit}&id=${UserID}`)
        const OverallList = await b.body.json()
        
        for(var i in OverallList) {
            if(OverallList[i].beatmap.id === ReqID) {
                DanKeyCheck = true
                ScoreList.push(OverallList[i]) 
            }
        }

        if (!DanKeyCheck) {
            const InvalidPlay = new EmbedBuilder()
                .setColor('DarkButNotBlack')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • No Score Found')
                .setDescription(`<:seiaehem:1244129111169826829> • You haven't set your score to submit this course... sorry!\n> ${DanName} - Submit Status: \`Failed\``)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidPlay]
            })
        } else {
            ScoreList = ScoreList.sort((a, b) => b.acc - a.acc)
            
            for(var i in ScoreList) {
                let SubStr = ScoreList[i].mods.split('|')[1]
                console.log(SubStr)
                if(SubStr.length > 0) ScoreList.splice(i, 1)
            }
            
            PlayResult = ScoreList[0]
            
            let Desc = '', SubmitKey = 0, Color = 'Red', Role
            const Mods = PlayResult.mods
            const SubStr = Mods.split('|')[0]
            
            if (DanKey === 'exdan' && SubmitKey === 0) {
                const n = DanMods.test(SubStr)
                console.log(n)
                SubmitKey = (n) ? 0 : 1
                if (SubmitKey === 0) {
                    let index = -1
                    for (var i in ReqAcc) {
                        if (PlayResult.acc >= ReqAcc[i]) {
                            Role = RoleID[i]
                            index = i
                            break
                        }
                    }
                    SubmitKey = (index === 0) ? 2 : (index === 1) ? 3 : 4
                }
            } else if (SubmitKey === 0) {
                const n = DanMods.test(SubStr)
                console.log(n)
                SubmitKey = (n) ? 0 : 1
                if (SubmitKey === 0) {
                    SubmitKey = (PlayResult.acc >= ReqAcc) ? 5 : 6
                }
            }

            console.log(SubmitKey)
            switch (SubmitKey) {
                case 2:
                case 5:
                    {
                        Color = 'Green'
                        Desc = `Congratulations, you have passed the requirement of the course!\n> ${DanName} - Submit Status: \`Passed\``
                        break
                    }
                case 3:
                    {
                        Color = 'Yellow'
                        Desc = `You failed the requirement to get This dan, but you cleared 13th Dan, anyways.\n> ${DanName} - Submit Status: \`Failed\``
                        break
                    }
                case 4:
                case 6:
                    {
                        Color = 'Red'
                        Desc = `Sorry, you didn't meet the requirement to pass the course.\n> ${DanName} - Submit Status: \`Failed\``
                        break
                    }
                case 1:
                    {
                        Color = 'Red'
                        Desc = `Sorry, you cannot use other mods (or you didn't use enough mods) to submit this course.\n> ${DanName} - Submit Status: \`Failed\``
                        break
                    }
                default: return
            }

            if ([2, 3, 5].includes(SubmitKey)) {
                if (!Role) Role = RoleID
                if (!iuser.roles.cache.has(Role)) iuser.roles.add(Role)
            }

            const SubmitStatus = new EmbedBuilder()
                .setColor(Color)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Course Submission')
                .setDescription(`<:seiaehem:1244129111169826829> • ${Desc}`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [SubmitStatus]
            })
        }
    }
}
