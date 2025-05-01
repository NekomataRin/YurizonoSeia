const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const DrxUsers = require('../../Database/DroidRx/drxuserdata')
const { request } = require('undici')
const FooterEmbeds = require('../../Utils/embed')
const { DroidRxMods } = require('../../Functions/DroidRx/Get/dr_Mods')
const PlayEmoList = require('../../Assets/DroidRx/Texts/play_emo')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recent')
        .setDescription('Get a recent score of a user, with offsets')
        .addIntegerOption(option => option.setName('id')
            .setDescription('The user\'s in game ID')
            .setMinValue(1)
            .setRequired(false))
        .addIntegerOption(option => option.setName('offset')
            .setDescription('The offset for that user\'s recent')
            .setMinValue(0)
            .setRequired(false))
        .addUserOption(option => option.setName('user')
            .setDescription('The discord user to get recent')
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
                .setDescription(`<:seiaehem:1244129111169826829> • There's no ID provided, either the user hasn't bound their account or the id itself is not provided, so I cannot look up for their recent play!`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidID]
            })
        } else {
            if (!UserID) UserID = GetID.UserID
        }

        const Offset = interaction.options.getInteger('offset') || 0
        const a = await request(`https://v4rx.me/api/get_user/?id=${UserID}`)
        const ProfileResult = await a.body.json()
        
        if (Number(Offset) >= Number(ProfileResult.stats.plays)) {
            const InvalidOffset = new EmbedBuilder()
                .setColor('DarkButNotBlack')
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                .setTitle('<:seiaconcerned:1244129048494473246> • Error: Invalid Offset')
                .setDescription(`<:seiaehem:1244129111169826829> • The offset is greater than the total play of that user, so that's invalid.`)
                .setTimestamp()
                .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
            return interaction.editReply({
                embeds: [InvalidOffset]
            })
        }

        const b = await request(`https://v4rx.me/api/recent/?id=${UserID}&offset=${Offset}`)
        const PlayResult = await b.body.json()

        const MapHash = PlayResult.maphash
        const c = await request(`https://osu.direct/api/v2/md5/${MapHash}`)
        const MapInfo = await c.body.json()

        const Mods = DroidRxMods(PlayResult.mods)
        const DifficultyName = MapInfo.version

        const MapID = MapInfo.id
        const MapSet = MapInfo.beatmapset_id

        const d = await request(`https://osu.direct/api/v2/s/${MapSet}`)
        const MapSetInfo = await d.body.json()

        const BeatmapBackground = `https://osu.direct/api/media/background/${MapID}`
        const MapTitle = `${MapSetInfo.artist} - ${MapSetInfo.title} [${DifficultyName}]`

        const ResultEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle(`<:seiaehem:1244129111169826829> Recent play of: \`${ProfileResult.name}\` \`[${ProfileResult.id}]\` (Offset: \`${Offset}\`)`)
            .setDescription(`▸ **Map Info:** ${MapTitle}\n▸ **Mods:** \`${Mods}\`\n\n> <:mikaeat:1254109782592327783> **Play Details:**\n• **PP:** \`${PlayResult.pp.toFixed(2)}\` • **Rating:** ${PlayEmoList.rating[PlayResult.rank]}\n• **Score:** \`${PlayResult.score}\` • **Accuracy:** \`${PlayResult.acc.toFixed(2)}%\`\n• **Combo:** \`${PlayResult.combo}x/${MapInfo.max_combo}x\`\n> ${PlayEmoList.hits.hit300} \`${PlayResult.hit300}\` | ${PlayEmoList.hits.hit100} \`${PlayResult.hit100}\` | ${PlayEmoList.hits.hit50} \`${PlayResult.hit50}\` | ${PlayEmoList.hits.hitmiss} \`${PlayResult.hitmiss}\``)
            .setTimestamp()
            .setThumbnail(BeatmapBackground)
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        await interaction.editReply({
            embeds: [ResultEmbed]
        })
    }
}