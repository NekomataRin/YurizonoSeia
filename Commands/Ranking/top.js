const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { OnCooldown } = require('../../Utils/cooldown')
const { ReqExp } = require('../../Utils/Ranking/lvlcalc')
const Level = require('../../Database/Ranking/Leveling')
const { FindCard } = require('../../Assets/RankCards')

const PerPage = 10

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Show the leaderboard of the community')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('The page you want to see from leaderboard')
                .setMinValue(1)
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()
        const Page = interaction.options.getInteger('page') || 1
        const cdtime = 30000

        if (await OnCooldown(interaction, 'Top', 'en-US', cdtime)) return

        //Sorted by total EXP inside this server, only the users of this page are loaded
        const filter = { GuildID: interaction.guild.id }
        const [Count, Users] = await Promise.all([
            Level.countDocuments(filter),
            Level.find(filter).sort({ total: -1, _id: 1 }).skip((Page - 1) * PerPage).limit(PerPage).lean()
        ])

        //Same total EXP = same rank (1, 2, 2, 4...)
        let Desc = '', Rank = 0
        for (let i = 0; i < Users.length; i++) {
            const User = Users[i]
            if (i === 0) Rank = await Level.countDocuments({ ...filter, total: { $gt: User.total } }) + 1
            else if (User.total !== Users[i - 1].total) Rank = (Page - 1) * PerPage + i + 1

            const Req = ReqExp(User.level)
            const ProgressTxt = `[${(User.exp / Req * 100).toFixed(2)}%] ${User.exp}/${Req}`
            Desc += `### • [${FindCard(User.background).Emoji}] **__Rank:__** #${Rank}\n• **__User:__** <@${User.UserID}> • **__Total PP:__** ${User.total}\n• **__Level:__** ${User.level} • **__Progress:__** ${ProgressTxt}\n`
            if (['Code-1', 'Code-2', 'Code-3'].includes(User.restrict)) Desc += `-# Note: This User Has Been Restricted (Restrict Code: [${User.restrict}])\n`
        }

        if (Desc === '') {
            Desc = '<:seiaconcerned:1244128341540208793> Hmm... looks like this page\'s so empty right now... Maybe time will tell the answer?'
        } else if (Count > Page * PerPage) {
            Desc += `\n\n<:seiaheh:1244128244664504392> Use command \`/top page:${Page + 1}\` to see page ${Page + 1}, if you liked please!`
        } else {
            Desc += `\n\n<:seiaehem:1244128370669650060> Alright, this is the end of the list... Only time will tell for the future of the leaderboard...`
        }

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, 'Yellow')
                .setTitle(`**Server Leaderboard** - \`(Page: ${Page})\``)
                .setDescription(Desc)]
        })
    }
}
