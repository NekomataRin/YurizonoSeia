const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const FooterEmbeds = require('../../Utils/embed')
const Level = require('../../Database/Ranking/Leveling')
const BotOwner = require('../../Utils/owners')
const GetReqExp = require('../../Utils/Ranking/lvlcalc')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-exp')
        .setDescription('-NekoRin\'s Only- Set the exp level for the user')
        .addIntegerOption(option =>
            option.setName('total-exp')
                .setDescription('Set the total exp of that user')
                .setMinValue(0)
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to set exp to')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        const usemem = await interaction.guild.members.fetch(interaction.user.id)
        var usingkey = false
        if (usemem.id === BotOwner[0] || usemem.id === BotOwner[1]) {
            usingkey = true
        }

        const NoPerm = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
            .setTitle('<:seiaconcerned:1244128341540208793> • No permissions')
            .setDescription('<:seiaehem:1244129111169826829> • You do not have enough permissions to run this command...')
            .setTimestamp()
            .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

        if (!usingkey) {
            return interaction.editReply({
                embeds: [NoPerm]
            })
        } else {
            const user = interaction.options.getUser('user') || interaction.user
            const Total_Exp = interaction.options.getInteger('total-exp')

            function ReturnExp(num) {
                if(num === 0) return [0, 0]
                let level = 0
                do {
                    num -= GetReqExp(level)
                    level++
                } while (num > GetReqExp(level))
                return [level, num] 
            }

            const ResultArr = ReturnExp(Total_Exp)
            Level.findOne({ UserID: user.id }, async (err, data) => {
                if (err) throw err
                if (!data) {
                    Level.create({
                        UserID: user.id,
                        GuildID: interaction.guild.id,
                        exp: ResultArr[1],
                        level: ResultArr[0],
                        total: Total_Exp,
                        background: 'none',
                        restrict: `Code-0`
                    })

                    const NewEmbed = new EmbedBuilder()
                        .setColor('Green')
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setTitle('<:seiaconcerned:1244128341540208793> • New Rank Data')
                        .setDescription(`<:seiaehem:1244129111169826829> • User: ${user} | Total Exp: ${Total_Exp} | Level: ${ReturnExp(Total_Exp)[0]} | Exp: ${ReturnExp(Total_Exp)[1]}`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({
                        embeds: [NewEmbed]
                    })

                } else {
                    const preExp = data.exp
                    const preLevel = data.level
                    const preTotal = data.total

                    data.exp = ResultArr[1]
                    data.level = ResultArr[0]
                    data.total = Total_Exp

                    data.save()
                    const EditEmbed = new EmbedBuilder()
                        .setColor('Blue')
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setTitle('<:seiaconcerned:1244128341540208793> • Edited Rank Data')
                        .setDescription(`<:seiaehem:1244129111169826829> • User: ${user} | Total Exp: ${preTotal} >> ${Total_Exp} | Level: ${preLevel} >> ${ReturnExp(Total_Exp)[0]} | Exp: ${preExp} >> ${ReturnExp(Total_Exp)[1]}`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })
                    await interaction.editReply({
                        embeds: [EditEmbed]
                    })
                }
            })
        }
    }
}
