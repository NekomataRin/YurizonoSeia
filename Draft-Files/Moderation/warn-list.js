const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const WarnList = require('../../Database/warnsys')
const ProtectedRoles = require('../../Utils/whitelistedrole')
const BotOwner = require('../../Utils/owners')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn-list')
        .setDescription('-Mod Only- See a user\'s total warning cases')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('user you want to see warning cases')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('page')
                .setDescription('The page you want to see from leaderboard')
                .setMinValue(1)
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const target = interaction.options.getUser('user')
        const member = await interaction.guild.members.fetch(target.id)
        const usemem = await interaction.guild.members.fetch(interaction.user.id)
        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const Page = interaction.options.getNumber('page') || 1

        var usingkey = false
        if (usemem.roles.cache.has('1244608723737903165')) {
            usingkey = true
        }

        const NoPerm = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • No permissions')
            .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const ErrDisplay = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • No Data')
            .setDescription(`<:seiaehem:1244129111169826829> • You know, ${target} is already clear from the beginning, what's the point for showing this?...`)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        const NoData = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • No Data')
            .setDescription(`<:seiaehem:1244129111169826829> • Well, ${target} has no warning cases, it's good to hear...`)
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        let key = false
        for (var i in ProtectedRoles) {
            if (member.roles.cache.has(ProtectedRoles[i])) {
                key = true
                break
            }
        }

        for (var i in BotOwner) {
            if (member.id === BotOwner[i]) {
                key = true
                break
            }
        }

        if (!usingkey) {
            return interaction.editReply({
                embeds: [NoPerm]
            })
        } else {
            if (key) {
                return interaction.editReply({
                    embeds: [ErrDisplay]
                })
            } else {
                WarnCounter = WarnList.findOne({ UserID: target.id }, async (err, data) => {
                    if (err) throw err
                    if (!data) {
                        return interaction.editReply({
                            embeds: [NoData]
                        })
                    }
                    if (data) {
                        let result = `<:SeiaBlank:1244890260215955486> Here are all of the warning cases for the following user: ${target}\n\n`, warns = [], reasons = []
                        for (var i = 0; i < data.Reason.length; i++) {
                            warns.push(`Warn: ${i + 1}`)
                            reasons.push(data.Reason[i])
                        }
                        if (!data.Reason) {
                            return interaction.editReply({
                                embeds: [NoData]
                            })
                        } else {
                            const PageUpLim = (Page * 10)
                            const PageDownLim = (Page * 10) - 10
                            const WarnList = warns.slice(PageDownLim, PageUpLim)
                            const ReasonList = reasons.slice(PageDownLim, PageUpLim)
                            var Desc = ''
                            for (var j = 0; j < WarnList.length; j++) {
                                let m = WarnList[j] + ReasonList[j]
                                Desc += m
                            }
                            if (Desc === '') {
                                Desc = '<:seiaconcerned:1244129048494473246> Hmm... looks like this page\'s so empty right now... Maybe time will tell the answer?'
                            }
                            if (WarnList.length === 10) {
                                Desc = `<:seiaheh:1244128991628103700> Use command \`/warn-list user:${member.username} page:${Page + 1}\` to see page ${Page + 1}, if you liked please!`
                            } else if (Desc !== '') {
                                Desc = `<:seiaehem:1244129111169826829> Alright, this is all from the list... Only time will tell for the future of the user's warn records...`
                            }
                            const Display = new EmbedBuilder()
                                .setColor('Yellow')
                                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                .setTitle(`<:seiaconcerned:1244129048494473246> • Warning Records (\`Page: ${Page}\`)`)
                                .setDescription(result + Desc)
                                .setTimestamp()
                                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                            if (WarnList.length > 0) {
                                for (var i in WarnList) {
                                    Display.addFields(
                                        {
                                            name: WarnList[i],
                                            value: ReasonList[i]
                                        }
                                    )
                                }
                            }
                            await interaction.editReply({
                                embeds: [Display]
                            })
                        }
                    }
                })
            }
        }
    }
}