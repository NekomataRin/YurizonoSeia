const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js')
const fs = require('fs')
const path = require('path')

const { SeiaEmbed, Footer } = require('../../Utils/embed')
const Config = require('../../Utils/config')
const BotOwner = require('../../Utils/owners')
const Log = require('../../Utils/logger')
const { Changelogs, Versions } = require('../../Assets/Changelog')
const { version: CurrentVersion } = require('../../package.json')

// Discord allows 6000 characters per message (all embeds together), keep some room
const MAX_EMBED = 5800

// One changelog -> messages to send ({ embeds, files }). Too long = continues in another message,
// the image goes under the last one
function BuildMessages(Data) {
    const embeds = []
    let embed, size
    const NewEmbed = (first) => {
        embed = new EmbedBuilder()
            .setColor(Data.Color)
            .setTitle((first) ? Data.Title : `${Data.Title} (tiếp)`)
            .setTimestamp()
            .setFooter(Footer())
        size = Data.Title.length + 100
        if (first && Data.Description) {
            embed.setDescription(Data.Description)
            size += Data.Description.length
        }
        embeds.push(embed)
    }

    NewEmbed(true)
    for (const Section of Data.Sections) {
        const add = Section.Name.length + Section.Value.length
        if (size + add > MAX_EMBED || (embed.data.fields?.length ?? 0) >= 25) NewEmbed(false)
        embed.addFields({ name: Section.Name, value: Section.Value })
        size += add
    }

    const image = (Data.Image) ? path.join(__dirname, '..', '..', 'Assets', 'Misc', Data.Image) : null
    if (image && !fs.existsSync(image)) Log.Warn(`Changelog v${Data.Version}: image not found (Assets/Misc/${Data.Image}), sent without it`)

    return embeds.map((e, i) => {
        if (i < embeds.length - 1 || !image || !fs.existsSync(image)) return { embeds: [e] }
        e.setImage(`attachment://${path.basename(image)}`)
        return { embeds: [e], files: [new AttachmentBuilder(image)] }
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('-Owner Only- Post the changelog of a version (try it in the test channel first)')
        .addStringOption(option =>
            option.setName('send-to')
                .setDescription('Where to send the changelog')
                .addChoices(
                    { name: '[Test] Test channel', value: 'test' },
                    { name: '[Publish] Announcement channels', value: 'publish' }
                )
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('version')
                .setDescription('The version - Default: the current version')
                .setAutocomplete(true)
                .setRequired(false)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        await interaction.respond(Versions.filter(v => v.startsWith(focusedValue)).slice(0, 25).map(v => ({ name: `v${v}`, value: v })))
    },

    async execute(interaction) {
        //Only the owner sees what happens
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        if (!BotOwner.includes(interaction.user.id)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle('<:seiaconcerned:1244128341540208793> • No permissions')
                    .setDescription('<:seiaehem:1244128370669650060> • You do not have enough permissions to run this command...')]
            })
        }

        const version = interaction.options.getString('version') || (Changelogs[CurrentVersion] ? CurrentVersion : Versions[0])
        const Data = Changelogs[version]
        if (!Data) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle('<:seiaconcerned:1244128341540208793> • Changelog not found')
                    .setDescription(`<:seiaehem:1244128370669650060> • There is no changelog for \`${version}\`... Available: ${Versions.map(v => `\`${v}\``).join(', ') || 'none'}`)]
            })
        }

        const Publish = interaction.options.getString('send-to') === 'publish'
        const Channels = (Publish) ? Object.values(Config.Channels.Announcements) : [Config.Channels.ChangelogTest]

        //Publishing asks once more (30s), so it isn't posted twice by mistake
        if (Publish) {
            const message = await interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Yellow')
                    .setTitle(`<:SeiaSip:1244890166116618340> • Publish changelog v${version}?`)
                    .setDescription(`<:seiaehem:1244128370669650060> • It will be posted in: ${Channels.map(id => `<#${id}>`).join(', ')}\n-# Did you try it with \`send-to: [Test]\` first, Dad?`)],
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('publish-yes').setLabel('| Publish').setEmoji('1244128244664504392').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('publish-no').setLabel('| Cancel').setEmoji('1244890584276008970').setStyle(ButtonStyle.Secondary)
                )]
            })
            const choice = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 30000 }).catch(() => null)
            if (choice?.customId !== 'publish-yes') {
                const Cancelled = { embeds: [SeiaEmbed(interaction, 'Grey').setTitle('<:seiaconcerned:1244128341540208793> • Publish cancelled').setDescription('<:seiaehem:1244128370669650060> • Nothing was posted.')], components: [] }
                return (choice) ? choice.update(Cancelled) : interaction.editReply(Cancelled)
            }
            await choice.update({ embeds: [SeiaEmbed(interaction, 'Yellow').setTitle('<:SeiaSip:1244890166116618340> • Posting...')], components: [] })
        }

        const Results = []
        for (const id of Channels) {
            try {
                const channel = await interaction.client.channels.fetch(id)
                for (const message of BuildMessages(Data)) await channel.send(message)
                Results.push(`✅ <#${id}>`)
            } catch (err) {
                Log.Error(`Changelog - cannot post in ${id}:`, err.message)
                Results.push(`❌ <#${id}> - \`${err.message}\``)
            }
        }

        await interaction.editReply({
            embeds: [SeiaEmbed(interaction, (Results.every(r => r.startsWith('✅'))) ? 'Green' : 'Red')
                .setTitle(`<:seiaheh:1244128244664504392> • Changelog v${version} - ${(Publish) ? 'Published' : 'Test'}`)
                .setDescription(Results.join('\n'))],
            components: []
        })
    }
}
