const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js')
const fs = require('fs')
const path = require('path')

const { SeiaEmbed, Footer } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const Config = require('../../Utils/config')
const BotOwner = require('../../Utils/owners')
const Log = require('../../Utils/logger')
const { Changelogs, Versions } = require('../../Assets/Changelog')
const { version: CurrentVersion } = require('../../package.json')

// Discord allows 6000 characters per message (all embeds together), keep some room
const MAX_EMBED = 5800

// One changelog -> messages to send ({ embeds, files }). Too long = continues in another message,
// the image goes under the last one. English readers get Data.En when the file has it
function BuildMessages(Data, LangKey = 'vi') {
    const en = (LangKey !== 'vi' && Data.En)
    const Text = (en) ? { ...Data, ...Data.En } : Data
    const embeds = []
    let embed, size
    const NewEmbed = (first) => {
        embed = new EmbedBuilder()
            .setColor(Data.Color)
            .setTitle((first) ? Text.Title : `${Text.Title} (${(en) ? 'cont.' : 'tiếp'})`)
            .setTimestamp()
            .setFooter(Footer())
        size = Text.Title.length + 100
        if (first && Text.Description) {
            embed.setDescription(Text.Description)
            size += Text.Description.length
        }
        embeds.push(embed)
    }

    NewEmbed(true)
    for (const Section of Text.Sections) {
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
        .setDescription('See what\'s new in Seia (the owners can also post it)')
        .setDescriptionLocalizations({ vi: 'Xem Seia có gì mới (chủ bot có thể đăng thông báo)' })
        .addStringOption(option =>
            option.setName('version')
                .setDescription('The version - Default: the current version')
                .setDescriptionLocalizations({ vi: 'Phiên bản - Mặc định: phiên bản hiện tại' })
                .setAutocomplete(true)
                .setRequired(false))
        .addStringOption(option =>
            option.setName('send-to')
                .setDescription('-Owner Only- Post it instead of just viewing it')
                .setDescriptionLocalizations({ vi: '-Owner Only- Đăng thông báo thay vì chỉ xem' })
                .addChoices(
                    { name: '[Test] Test channel', value: 'test', name_localizations: { vi: '[Test] Kênh test' } },
                    { name: '[Publish] Announcement channels', value: 'publish', name_localizations: { vi: '[Publish] Các kênh thông báo' } }
                )
                .setRequired(false)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        await interaction.respond(Versions.filter(v => v.startsWith(focusedValue)).slice(0, 25).map(v => ({ name: `v${v}`, value: v })))
    },

    async execute(interaction) {
        //Only the user sees it (viewing, or the owner's post report)
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')

        const version = interaction.options.getString('version') || (Changelogs[CurrentVersion] ? CurrentVersion : Versions[0])
        const Data = Changelogs[version]
        if (!Data) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Không tìm thấy changelog' : 'Changelog not found'}`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? `Không có changelog cho \`${version}\`... Hiện có` : `There is no changelog for \`${version}\`... Available`}: ${Versions.map(v => `\`${v}\``).join(', ') || 'none'}`)]
            })
        }

        //Viewing: anyone, in their language
        const SendTo = interaction.options.getString('send-to')
        if (!SendTo) {
            const [First, ...Rest] = BuildMessages(Data, LangKey)
            await interaction.editReply(First)
            for (const message of Rest) await interaction.followUp({ ...message, flags: MessageFlags.Ephemeral })
            return
        }

        //Posting: bot owners only
        if (!BotOwner.includes(interaction.user.id)) {
            return interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Red')
                    .setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Không đủ quyền' : 'No permissions'}`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? 'Chỉ chủ bot mới đăng được changelog thôi, nhưng Sensei vẫn xem được nếu bỏ trống `send-to` nhé!' : 'Only the bot owners can post it, but you can still read it by leaving `send-to` empty!'}`)]
            })
        }

        const Publish = (SendTo === 'publish')
        const Channels = (Publish) ? Object.values(Config.Channels.Announcements) : [Config.Channels.ChangelogTest]

        //Publishing asks once more (30s), so it isn't posted twice by mistake
        if (Publish) {
            const message = await interaction.editReply({
                embeds: [SeiaEmbed(interaction, 'Yellow')
                    .setTitle(`<:SeiaSip:1244890166116618340> • ${vi ? `Đăng changelog v${version}?` : `Publish changelog v${version}?`}`)
                    .setDescription(`<:seiaehem:1244128370669650060> • ${vi ? 'Sẽ được đăng ở' : 'It will be posted in'}: ${Channels.map(id => `<#${id}>`).join(', ')}\n-# ${vi ? 'Bố đã thử với `send-to: [Test]` trước chưa đó?' : 'Did you try it with `send-to: [Test]` first, Dad?'}`)],
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('publish-yes').setLabel(vi ? '| Đăng' : '| Publish').setEmoji('1244128244664504392').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('publish-no').setLabel(vi ? '| Huỷ' : '| Cancel').setEmoji('1244890584276008970').setStyle(ButtonStyle.Secondary)
                )]
            })
            const choice = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 30000 }).catch(() => null)
            if (choice?.customId !== 'publish-yes') {
                const Cancelled = { embeds: [SeiaEmbed(interaction, 'Grey').setTitle(`<:seiaconcerned:1244128341540208793> • ${vi ? 'Đã huỷ đăng' : 'Publish cancelled'}`).setDescription(`<:seiaehem:1244128370669650060> • ${vi ? 'Chưa có gì được đăng cả.' : 'Nothing was posted.'}`)], components: [] }
                return (choice) ? choice.update(Cancelled) : interaction.editReply(Cancelled)
            }
            await choice.update({ embeds: [SeiaEmbed(interaction, 'Yellow').setTitle(`<:SeiaSip:1244890166116618340> • ${vi ? 'Đang đăng...' : 'Posting...'}`)], components: [] })
        }

        //The announcement itself is always the Vietnamese one
        const Results = []
        for (const id of Channels) {
            try {
                const channel = await interaction.client.channels.fetch(id)
                for (const message of BuildMessages(Data, 'vi')) await channel.send(message)
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
