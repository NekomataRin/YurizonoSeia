const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const DrxUsers = require('../../Database/DroidRx/drxuserdata')
const { request } = require('undici')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-bind')
        .addUserOption(option => option.setName('user')
            .setDescription('The user you watned to bind that id to')
            .setRequired(true))
        .setDescription('-Dev Only- Bind a osudroid!relax Account to a user (ONLY ONE/DISCORD USER)')
        .addIntegerOption(option => option.setName('id')
            .setDescription('The osudroid!relax User ID you wanted to bind')
            .setMinValue(1)
            .setRequired(false))
        .addStringOption(option => option.setName('username')
            .setDescription('The osudroid!relax Username you wanted to bind')
            .setMinLength(1)
            .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const DevList = await interaction.guild.roles.cache.get('1095655182852968518').members.map(m => m.user.id)
        const RunKey = (DevList.includes(interaction.user.id)) ? true : false
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        if (!RunKey) {
            const NoPerm = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • No permissions')
                .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [NoPerm]
            })
        }

        const Dr_ID = interaction.options.getInteger('id') || -1
        const UserName = interaction.options.getString('username') || ''
        const User = interaction.options.getUser('user')
        const Url = (Number(Dr_ID) > 0) ? `https://v4rx.me/api/get_user/?id=${Dr_ID}` : `https://v4rx.me/api/get_user/?name=${UserName}`
        const { body } = await request(Url)
        const Result = await body.json()

        const Keys = Object.keys(Result)
        if (['error'].includes(Keys[0])) {
            const InvalidUser = new EmbedBuilder()
                .setColor('DarkButNotBlack')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Error: User not Found')
                .setDescription(`<:seiaehem:1244129111169826829> • There\'s no user with this id ${Dr_ID}, so I cannot bind this to that user!`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidUser]
            })
        }

        if (User.bot) {
            const InvalidUser = new EmbedBuilder()
                .setColor('Yellow')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Error: Bot user')
                .setDescription(`<:seiaehem:1244129111169826829> • Nah, even me, also a bot, how do we use the command if you bind this user id to one of us?`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidUser]
            })
        }
        const IDCheck = await DrxUsers.findOne({ UserID: Result.id }) || -1

        const AvtUrl = `https://v4rx.me/user/avatar/${Result.id}.png/`
        DrxUsers.findOne({ DiscordID: User.id }, async (err, data) => {
            if (err) throw err
            if (!data) {
                if (IDCheck.UserID === Dr_ID) {
                    const DUser = new EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setTitle('<:seiaconcerned:1244129048494473246> • User: Bind Account')
                        .setDescription(`<:seiaehem:1244129111169826829> • Nope, you can see that ONLY ONE per account, so that's a no from me, I won't bind this to them!`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    return interaction.editReply({
                        embeds: [DUser]
                    })
                } else {
                    DrxUsers.create({
                        DiscordID: User.id,
                        UserID: Result.id
                    })
                    const NewBind = new EmbedBuilder()
                        .setColor('Yellow')
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setTitle('<:seiaconcerned:1244129048494473246> • User: Bind Account')
                        .setDescription(`<:SeiaSip:1244890166116618340> Successfully bound account to ${User}\n[:flag_${Result.country.toLowerCase()}:] **Username:** \`${Result.name}\` ▸ **User ID:** \`${Result.id}\`\n\n-# Responsible Dev: ${interaction.user}`)
                        .setTimestamp()
                        .setThumbnail(AvtUrl)
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({
                        embeds: [NewBind]
                    })
                }
            } else {
                if (User.id === data.DiscordID && data.UserID === Number(Dr_ID)) {
                    const DuplicatedId = new EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setTitle('<:seiaconcerned:1244129048494473246> • User: Bind Account')
                        .setDescription(`<:seiaehem:1244129111169826829> • Nah... this is the same thing... okay, why do you need to double check for this?`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    return interaction.editReply({
                        embeds: [DuplicatedId]
                    })
                }

                if (User.id === data.DiscordID && data.UserID !== Number(Dr_ID)) {
                    data.UserID = Result.id
                    const EditBind = new EmbedBuilder()
                        .setColor('Yellow')
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setTitle('<:seiaconcerned:1244129048494473246> • User: Bind Account')
                        .setDescription(`<:SeiaSip:1244890166116618340> Successfully changed the bound account to ${User}\n[:flag_${Result.country.toLowerCase()}:] **Username:** \`${Result.name}\` ▸ **User ID:** \`${Result.id}\`\n\n-# Responsible Dev: ${interaction.user}`)
                        .setTimestamp()
                        .setThumbnail(AvtUrl)
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({
                        embeds: [EditBind]
                    })
                    data.save()
                }
            }
        })
    }
}