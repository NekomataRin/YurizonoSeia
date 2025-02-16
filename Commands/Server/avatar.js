const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const chalk = require('chalk')
const cdSchema = require('../../Database/cooldown')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('View an avatar of a user, or yourself')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Show the user\'s avatar')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('option')
                .setDescription('Show the options for this command')
                .addChoices(
                    {
                        name: '[Banner]',
                        value: 'banner'
                    },
                    {
                        name: '[Guild]',
                        value: 'guild'
                    },
                    {
                        name: '[Guild + Banner]',
                        value: 'gnb'
                    }
                )
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply()

        const iuser = await interaction.guild.members.fetch(interaction.user.id)
        const cdtime = 5000

        let user, BannerURL
        const OptionKey = await interaction.options.getString('option') || 'none'
        switch (OptionKey) {
            case 'banner':
                {
                    user = interaction.options.getUser('user') || interaction.user
                    user = await user.fetch()
                    BannerURL = user.bannerURL({ extension: 'png', size: 512, dynamic: true })
                    console.log(`${chalk.cyanBright('[DEBUG]')} ${BannerURL}`)
                    break
                }
            case 'guild':
                {
                    user = interaction.options.getMember('user') || interaction.user
                    user = await interaction.guild.members.fetch(user.id)
                    break
                }
            case 'gnb':
                {
                    user = interaction.options.getMember('user') || interaction.user
                    let n = await user.fetch()
                    user = await interaction.guild.members.fetch(user.id)
                    BannerURL = n.bannerURL({ extension: 'png', size: 512, dynamic: true })
                    console.log(`${chalk.cyanBright('[DEBUG]')} ${BannerURL}`)
                    break
                }
            default:
                {
                    user = interaction.options.getUser('user') || interaction.user
                    user = await user.fetch()
                }
        }

        cdSchema.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                cdSchema.create({
                    UserID: interaction.user.id,
                    Avatar: Date.now()
                })
                await interaction.editReply('<:seiaconcerned:1244129048494473246> Well, since you haven\'t in cooldown database yet... now you can try again')
            } else {
                const cduser = data.UserID
                const CDTime = data.Avatar
                console.log(chalk.yellow('[Command: Avatar]') + ` ${cduser}, ${CDTime}, ${Date.now()}`)

                if (CDTime > Date.now()) {
                    const cdembed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`**Command - Cooldown**`)
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setDescription(` <:seiaconcerned:1244129048494473246> | ${interaction.user} Sensei! Can you please stop doing that command again? I'm exhausted, I can take a rest too, you know? I'm not some sort of a real robot who can repeatedly do this for you!`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({ embeds: [cdembed] })
                } else {
                    data.Avatar = Date.now() + cdtime
                    data.save()
                    switch (OptionKey) {
                        case 'guild': {
                            const GuildAvt = new EmbedBuilder()
                                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                .setTitle(`<:seiaehem:1244128370669650060> **Avatar Displayer** (Guild)`)
                                .setDescription(`[PNG Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'png' })}) • [JPG Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'jpg' })}) • [WEBP Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'webp' })})\n> <:SeiaPeek:1244890461592621147> **(User: ${user})**`)
                                .setColor('Blue')
                                .setTimestamp()
                                .setImage(`${user.displayAvatarURL({ dynamic: true, size: 2048, extension: 'png' })}`)
                                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                            await interaction.editReply({
                                embeds: [GuildAvt]
                            })
                            break
                        }
                        case 'banner':
                            {
                                const Avt = new EmbedBuilder()
                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                    .setTitle(`<:seiaehem:1244128370669650060> **Avatar Displayer** (Global)`)
                                    .setDescription(`[PNG Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'png' })}) • [JPG Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'jpg' })}) • [WEBP Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'webp' })})\n> <:SeiaPeek:1244890461592621147> **(User: ${user})**`)
                                    .setColor('Blue')
                                    .setTimestamp()
                                    .setImage(`${user.displayAvatarURL({ dynamic: true, size: 2048, extension: 'png' })}`)
                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                await interaction.editReply({
                                    embeds: [Avt]
                                })
                                if (BannerURL !== null) {
                                    const BannerAvt = new EmbedBuilder()
                                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                        .setTitle(`<:seiaehem:1244128370669650060> **Banner Displayer** (Global)`)
                                        .setDescription(`[Banner_URL](${BannerURL})\n> <:SeiaPeek:1244890461592621147> **(User: ${user})**`)
                                        .setColor('Blue')
                                        .setTimestamp()
                                        .setImage(BannerURL)
                                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                    await interaction.followUp({
                                        embeds: [BannerAvt]
                                    })
                                }
                                break
                            }
                        case 'gnb':
                            {
                                const GuildAvt = new EmbedBuilder()
                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                    .setTitle(`<:seiaehem:1244128370669650060> **Avatar Displayer** (Guild)`)
                                    .setDescription(`[PNG Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'png' })}) • [JPG Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'jpg' })}) • [WEBP Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'webp' })})\n> <:SeiaPeek:1244890461592621147> **(User: ${user})**`)
                                    .setColor('Blue')
                                    .setTimestamp()
                                    .setImage(`${user.displayAvatarURL({ dynamic: true, size: 2048, extension: 'png' })}`)
                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                await interaction.editReply({
                                    embeds: [GuildAvt]
                                })
                                const BannerAvt = new EmbedBuilder()
                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                    .setTitle(`<:seiaehem:1244128370669650060> **Banner Displayer** (Global)`)
                                    .setDescription(`[Banner_URL](${BannerURL})\n> <:SeiaPeek:1244890461592621147> **(User: ${user})**\n> *Note: Due to the API itself, I can't find the way to show the user's guild banner.*`)
                                    .setColor('Blue')
                                    .setTimestamp()
                                    .setImage(BannerURL)
                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                await interaction.followUp({
                                    embeds: [BannerAvt]
                                })
                                break
                            }
                        default:
                            {
                                const Avt = new EmbedBuilder()
                                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                                    .setTitle(`<:seiaehem:1244128370669650060> **Avatar Displayer** (Global)`)
                                    .setDescription(`[PNG Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'png' })}) • [JPG Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'jpg' })}) • [WEBP Format](${user.displayAvatarURL({ dynamic: true, size: 512, extension: 'webp' })})\n> <:SeiaPeek:1244890461592621147> **(User: ${user})**`)
                                    .setColor('Blue')
                                    .setTimestamp()
                                    .setImage(`${user.displayAvatarURL({ dynamic: true, size: 2048, extension: 'png' })}`)
                                    .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                                await interaction.editReply({
                                    embeds: [Avt]
                                })
                            }
                    }
                }
            }
        })
    }
}