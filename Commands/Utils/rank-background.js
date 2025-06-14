const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const Level = require('../../Database/Ranking/Leveling')
const UserCards = require('../../Database/Ranking/usercards')
const FooterEmbeds = require('../../Utils/embed')
const RankingArr = require('../../Assets/RankCards/rankcardarr')
const BotOwner = require('../../Utils/owners')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank-background')
        .setDescription('-Mod Only- Set a user\'s background of their rank card, or set yours')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user where you want to set it')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('The keyword of the background (ex. shiroko, hoshino...)')
                .setRequired(false)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('method')
                .setDescription('Method of the keyword for that user (Default: [Set])')
                .addChoices(
                    {
                        name: '[Add]',
                        value: 'add'
                    },
                    {
                        name: '[Remove]',
                        value: 'remove'
                    },
                    {
                        name: '[Set]',
                        value: 'set'
                    },
                )
                .setRequired(false)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        const choices = []
        for(var i in RankingArr) {
            choices.push(RankingArr[i][0])
        }
        let filtered = choices.filter(choice => choice.startsWith(focusedValue))
        filtered = filtered.slice(0,24)
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice}))
        )
    },
    async execute(interaction) {
        await interaction.deferReply()

        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        var user = interaction.options.getUser('user') || interaction.user
        user = user.id
        var key = interaction.options.getString('keyword')
        if (key === null) {
            key = 'none'
        } else {
            key = key.trim()
            key = key.toLowerCase()
        }
        var MethodValue = interaction.options.getString('method') || 'set'
        let runkey = false
        const KeyList = []
        for(var i in RankingArr) {
            KeyList.push(RankingArr[i][0])
        }
        
        for (i in KeyList) {
            if (key === KeyList[i]) {
                runkey = true
                break
            }
        }

        console.log(key, runkey, MethodValue)

        const usemem = await interaction.guild.members.fetch(interaction.user.id)
        var usingkey = false
        if (usemem.roles.cache.has('1244608723737903165') || BotOwner.includes(usemem.id)) {
            usingkey = true
        }

        const NoPerm = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244128341540208793> • No permissions')
            .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        if (usingkey) {
            if (!runkey) {
                const InvalidKey = new EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                    .setTitle('<:seiaconcerned:1244128341540208793> • Invaid Key')
                    .setDescription(`<:seiaehem:1244129111169826829> • You provided an invalid ranking keyword \`${key}\`... It's not in the key list provided...`)
                    .setTimestamp()
                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                return interaction.editReply({
                    embeds: [InvalidKey]
                })
            }
            Level.findOne({ UserID: user }, async (err, data) => {
                if (err) throw err
                if (!data) {
                    await interaction.editReply('<:seiaheh:1244128244664504392> • Looks like the user you chose is currently not active yet... Please try again later...')
                }
                if (data) {
                    const previouskey = data.background
                    if (key === 'none' && previouskey === key) {
                        const SkipKey = new EmbedBuilder()
                            .setColor('DarkButNotBlack')
                            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                            .setTitle('<:seiaheh:1244128244664504392> • Key skipped')
                            .setDescription(`<:seiaehem:1244129111169826829> • Since you wrote '\`${key}\`', I skipped this for <@${user}> for now...`)
                            .setTimestamp()
                            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

                        await interaction.editReply({
                            embeds: [SkipKey]
                        })
                    } else if (MethodValue === 'set') {
                        data.background = key
                        let desc
                        if (data.background === 'none') {
                            desc = `Successfully restored the default card background for <@${user}>`
                        } else {
                            desc = `Successfully set the rank card background '\`${key}\`' for <@${user}>`
                        }

                        const EditKey = new EmbedBuilder()
                            .setColor('Yellow')
                            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                            .setTitle('<:seiaheh:1244128244664504392> • The key has been successfully set.')
                            .setDescription(`<:seiaehem:1244129111169826829> • ${desc}`)
                            .setTimestamp()
                            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

                        await interaction.editReply({
                            embeds: [EditKey]
                        })
                        data.save()
                    }
                    if (key !== 'none') {
                        UserCards.findOne({ UserID: user }, async (err, data1) => {
                            if (err) throw err
                            if (!data1) {
                                if (MethodValue === 'add' || MethodValue === 'set') {
                                    UserCards.create({
                                        UserID: user,
                                        Cards: [key]
                                    })
                                    desc = `Successfully added the rank card background '\`${key}\`' to the list for <@${user}>`
                                    const AddKey = new EmbedBuilder()
                                        .setColor('Yellow')
                                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                        .setTitle('<:seiaheh:1244128244664504392> • The key has been successfully added.')
                                        .setDescription(`<:seiaehem:1244129111169826829> • ${desc}`)
                                        .setTimestamp()
                                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                    await interaction.editReply({
                                        embeds: [AddKey]
                                    })
                                } else return
                            }
                            if (data1) {
                                let Cards = data1.Cards
                                switch (MethodValue) {
                                    case 'add':
                                    case 'set':
                                        {
                                            if (Cards.indexOf(key) === -1) {
                                                data1.Cards.push(key)
                                                data1.save()
                                                desc = `Successfully added the rank card background '\`${key}\`' to the list for <@${user}>`
                                                if (MethodValue === 'set') {
                                                    desc = `Also, I added the rank card background '\`${key}\`' to the list for <@${user}>`
                                                }
                                                const AddKey = new EmbedBuilder()
                                                    .setColor('Yellow')
                                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                                    .setTitle('<:seiaheh:1244128244664504392> • The key has been successfully added.')
                                                    .setDescription(`<:seiaehem:1244129111169826829> • ${desc}`)
                                                    .setTimestamp()
                                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                                return interaction.editReply({
                                                    embeds: [AddKey]
                                                })
                                            }
                                            if (MethodValue === 'add' && Cards.indexOf(key) !== -1) {
                                                desc = `The following key: '\`${key}\`' does not have any efffect on <@${user}>, lol`
                                                const IgnoreKey = new EmbedBuilder()
                                                    .setColor('Yellow')
                                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                                    .setTitle('<:seiaheh:1244128244664504392> • The key has been ignored.')
                                                    .setDescription(`<:seiaehem:1244129111169826829> • ${desc}`)
                                                    .setTimestamp()
                                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                                await interaction.editReply({
                                                    embeds: [IgnoreKey]
                                                })
                                            }
                                            break
                                        }
                                    case 'remove':
                                        {
                                            if (Cards.indexOf(key) !== -1) {
                                                let a = data1.Cards.filter(a => a !== key)
                                                data1.Cards = a
                                                data1.save()
                                                desc = `Successfully removed the rank card background '\`${key}\`' to the list for <@${user}>`
                                                const RemoveKey = new EmbedBuilder()
                                                    .setColor('Yellow')
                                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                                    .setTitle('<:seiaheh:1244128244664504392> • The key has been successfully removed.')
                                                    .setDescription(`<:seiaehem:1244129111169826829> • ${desc}`)
                                                    .setTimestamp()
                                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                                return interaction.editReply({
                                                    embeds: [RemoveKey]
                                                })
                                            } else {
                                                desc = `The following key: '\`${key}\`' does not have any efffect on <@${user}>, lol`
                                                const IgnoreKey = new EmbedBuilder()
                                                    .setColor('Yellow')
                                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                                    .setTitle('<:seiaheh:1244128244664504392> • The key has been ignored.')
                                                    .setDescription(`<:seiaehem:1244129111169826829> • ${desc}`)
                                                    .setTimestamp()
                                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                                await interaction.editReply({
                                                    embeds: [IgnoreKey]
                                                })
                                            }
                                            break
                                        }
                                    default: return
                                }
                            }
                        })
                    }
                }
            })
        } else {
            await interaction.editReply({
                embeds: [NoPerm]
            })
        }
    }
}