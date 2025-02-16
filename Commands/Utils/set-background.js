const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const Level = require('../../Database/Leveling')
const UserCards = require('../../Database/usercards')
const FooterEmbeds = require('../../Utils/embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-background')
        .setDescription('Set your rank card in this server')
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('The rank card you unlocked')
                .setAutocomplete(true)
                .setRequired(true)
        ),
    async autocomplete(interaction) {
        let UnlokedCards = await UserCards.findOne({ UserID: interaction.user.id }).select('-_id Cards')
        UnlokedCards = ['none', ...UnlokedCards.Cards] || ['none']
        const focusedValue = interaction.options.getFocused()
        const choices = UnlokedCards
        let filtered = choices.filter(choice => choice.startsWith(focusedValue))
        filtered = filtered.slice(0,24)
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        )
    },
    async execute(interaction) {
        await interaction.deferReply()
        const key = interaction.options.getString('keyword')
        const iuser = await interaction.guild.members.fetch(interaction.user.id)

        Level.findOne({ UserID: interaction.user.id }, async (err, data) => {
            if (err) throw err
            if (!data) return
            else {
                const previouskey = Level.key
                if (key === 'none' && key === previouskey) {
                    const SkipKey = new EmbedBuilder()
                        .setColor('DarkButNotBlack')
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setTitle('<:seiaheh:1244128991628103700> • Key skipped')
                        .setDescription(`<:seiaehem:1244129111169826829> • Since you wrote '\`${key}\`', I skipped this for you then...`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

                    await interaction.editReply({
                        embeds: [SkipKey]
                    })
                } else {
                    data.background = key
                    let desc
                    if (data.background === 'none') {
                        desc = `Successfully restored the default card background for <@${interaction.user.id}>`
                    } else {
                        desc = `Successfully set the rank card background '\`${key}\`' for <@${interaction.user.id}>`
                    }

                    const EditKey = new EmbedBuilder()
                        .setColor('Yellow')
                        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${iuser.displayAvatarURL({ dynamic: true, size: 512 })}` })
                        .setTitle('<:seiaheh:1244128991628103700> • The key has been successfully set.')
                        .setDescription(`<:seiaehem:1244129111169826829> • ${desc}`)
                        .setTimestamp()
                        .setFooter({ text: `${FooterEmbeds[0][0]}`, iconURL: `${FooterEmbeds[1][Math.floor(Math.random() * FooterEmbeds[1].length)]}` })

                    await interaction.editReply({
                        embeds: [EditKey]
                    })
                    data.save()
                }
            }
        })
    }
}