const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const FooterEmbeds = require('../../Utils/embed')
const { GetDroidRxUser } = require('../../Functions/DroidRx/Generate/dr_Profile')
const DrxUsers = require('../../Database/DroidRx/drxuserdata')
const BannerObj = require('../../Assets/DroidRx/Texts/dr-banner')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Get profile of a user in game')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The id of the user to get the profile')
                .setMinValue(1)
                .setRequired(false))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get the profile (note: works if they binded game account)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        let UserID = interaction.options.getInteger('id')
        const guser = interaction.options.getUser('user') || interaction.user
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const GetID = await DrxUsers.findOne({ DiscordID: guser.id })
        if (!GetID) {
            const InvalidID = new EmbedBuilder()
                .setColor('DarkButNotBlack')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Error: Invalid User ID')
                .setDescription(`<:seiaehem:1244129111169826829> • There's no ID provided, either the user hasn't binded their account or the id itself is not provided, so I cannot look up for a profile!`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidID]
            })
        } else {
            if(!UserID) UserID = GetID.UserID
        }

        let key, discordid
        const UserInfo = await DrxUsers.findOne({ UserID: UserID })
        const DanList = []
        if (!UserInfo) {
            DanList.push('default')
            key = false
        } else {
            key = true
            discordid = UserInfo.DiscordID
            const User = await interaction.guild.members.fetch(UserInfo.DiscordID)
            for (var i in Object.keys(BannerObj)) {
                if (User.roles.cache.has(BannerObj[Object.keys(BannerObj)[i]].role_id)) {
                    DanList.unshift(Object.keys(BannerObj)[i])
                }
            }
        }
        
        const ResultObj = await GetDroidRxUser(UserID, DanList[0], discordid, key)
        
        if (!ResultObj) {
            const InvalidUser = new EmbedBuilder()
                .setColor('DarkButNotBlack')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Error: User not Found')
                .setDescription(`<:seiaehem:1244129111169826829> • There's no user with this id ${UserID}, so I cannot look up that user's profile!`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidUser]
            })
        }

        const ReturnEmbed = new EmbedBuilder()
            .setColor(ResultObj.Color)
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244129048494473246> • Profile View')
            .setDescription(`<:SeiaSip:1244890166116618340> [:flag_${ResultObj.UserInfo.country.toLowerCase()}:] **Username:** \`${ResultObj.UserInfo.name}\` ▸ **User ID:** \`${ResultObj.UserInfo.id}\`\n▸ **Binded To:** ${ResultObj.BindedTo}`)
            .setTimestamp()
            .setImage(ResultObj.Ctx)
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
        await interaction.editReply({
            embeds: [ReturnEmbed],
            files: [ResultObj.Image]
        })
    }
}