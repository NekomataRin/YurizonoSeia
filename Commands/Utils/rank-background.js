const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const Config = require('../../Utils/config')
const Level = require('../../Database/Ranking/Leveling')
const UserCards = require('../../Database/Ranking/usercards')
const { RankCards } = require('../../Assets/RankCards')
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
        const focusedValue = interaction.options.getFocused().toLowerCase()
        const filtered = RankCards.map(card => card.Key).filter(key => key.startsWith(focusedValue)).slice(0, 25)
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })))
    },

    async execute(interaction) {
        await interaction.deferReply()

        const member = await interaction.guild.members.fetch(interaction.user.id)
        if (!member.roles.cache.has(Config.Roles.Mod) && !BotOwner.includes(member.id) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle('<:seiaconcerned:1244128341540208793> • No permissions')
                    .setDescription('<:seiaehem:1244128370669650060> • You do not have enough permissions to run this command...')]
            })
        }

        const user = (interaction.options.getUser('user') || interaction.user).id
        const key = (interaction.options.getString('keyword') || 'none').trim().toLowerCase()
        const MethodValue = interaction.options.getString('method') || 'set'

        const Reply = (title, desc, color = 'Yellow') => interaction.editReply({
            content: '',
            embeds: [SeiaEmbed(interaction, color)
                .setTitle(`<:seiaheh:1244128244664504392> • ${title}`)
                .setDescription(`<:seiaehem:1244128370669650060> • ${desc}`)]
        })

        if (!RankCards.some(card => card.Key === key)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle('<:seiaconcerned:1244128341540208793> • Invaid Key')
                    .setDescription(`<:seiaehem:1244128370669650060> • You provided an invalid ranking keyword \`${key}\`... It's not in the key list provided...`)]
            })
        }

        //[Set]: equip it on this server (+ unlock it if needed)
        if (MethodValue === 'set') {
            const data = await Level.findOne({ GuildID: interaction.guild.id, UserID: user })
            if (!data) return interaction.editReply('<:seiaheh:1244128244664504392> • Looks like the user you chose is currently not active yet... Please try again later...')

            if (key === 'none' && data.background === key) {
                return Reply('Key skipped', `Since you wrote '\`${key}\`', I skipped this for <@${user}> for now...`, 'DarkButNotBlack')
            }

            data.background = key
            await data.save()

            let desc = (key === 'none') ? `Successfully restored the default card background for <@${user}>` : `Successfully set the rank card background '\`${key}\`' for <@${user}>`
            if (key !== 'none') {
                const added = await UserCards.updateOne({ UserID: user }, { $addToSet: { Cards: key } }, { upsert: true })
                if (added.modifiedCount || added.upsertedCount) desc += `\nAlso, I added the rank card background '\`${key}\`' to the list for <@${user}>`
            }
            return Reply('The key has been successfully set.', desc)
        }

        //[Add] / [Remove]: only change the unlocked list
        if (key === 'none') {
            return Reply('The key has been ignored.', `The following key: '\`${key}\`' does not have any efffect on <@${user}>, lol`)
        }

        const update = (MethodValue === 'add') ? { $addToSet: { Cards: key } } : { $pull: { Cards: key } }
        const result = await UserCards.updateOne({ UserID: user }, update, { upsert: MethodValue === 'add' })
        if (!result.modifiedCount && !result.upsertedCount) {
            return Reply('The key has been ignored.', `The following key: '\`${key}\`' does not have any efffect on <@${user}>, lol`)
        }

        return (MethodValue === 'add')
            ? Reply('The key has been successfully added.', `Successfully added the rank card background '\`${key}\`' to the list for <@${user}>`)
            : Reply('The key has been successfully removed.', `Successfully removed the rank card background '\`${key}\`' to the list for <@${user}>`)
    }
}
