const { SlashCommandBuilder } = require('discord.js')

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { IsMod } = require('../../Utils/mod')
const BotOwner = require('../../Utils/owners')
const Clock = require('../../Utils/clock')
const ModAfk = require('../../Database/Server/mod-afk')
const { ModE } = require('../../Functions/Moderation/mod')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mod-afk')
        .setDescription('-Mod/Owner Only- Set your AFK status: Seia reminds whoever pings you')
        .setDescriptionLocalizations({ vi: '-Mod/Owner Only- Bật/tắt trạng thái AFK: ai ping bạn sẽ bị Seia nhắc nhở' })
        .addBooleanOption(option =>
            option.setName('status')
                .setDescription('AFK on (True) or off (False) - Default: False')
                .setDescriptionLocalizations({ vi: 'Bật (True) hoặc tắt (False) AFK - Mặc định: False' })
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        const vi = (LangKey === 'vi')
        const Embed = (color, title, desc) => SeiaEmbed(interaction, color).setTitle(`${ModE.Orin} **${title}**`).setDescription(`${interaction.user}\n> ${desc}`)

        //Mod roles of this server, or a bot owner
        if (!IsMod(interaction.member) && !BotOwner.includes(interaction.user.id)) {
            return interaction.editReply({ embeds: [SeiaEmbed(interaction, 'DarkAqua')
                .setTitle(`${ModE.Bruh} ${vi ? 'Không đủ thẩm quyền' : 'Not enough authority'}`)
                .setDescription(`${ModE.Doi} | ${vi ? 'Lệnh này chỉ dành cho Mod của server hoặc chủ bot thôi!' : 'This command is only for the Mods of this server or the bot owners!'}`)] })
        }

        const AFK = interaction.options.getBoolean('status') ?? false
        const filter = { GuildID: interaction.guild.id, UserID: interaction.user.id }

        if (AFK) {
            const before = await ModAfk.findOneAndUpdate(filter, { $setOnInsert: { Since: Clock.Now() } }, { upsert: true }).lean()
            return interaction.editReply({ embeds: [(before)
                ? Embed('Green', vi ? 'AFK vẫn đang bật' : 'Still AFK', vi ? `Bạn đã AFK từ <t:${Math.floor(before.Since / 1000)}:R> rồi mà` : `You've been AFK since <t:${Math.floor(before.Since / 1000)}:R>`)
                : Embed('Green', vi ? 'Đã bật AFK!' : 'AFK on!', vi ? 'Đã set trạng thái AFK của bạn là `True`, ai ping bạn sẽ bị em nhắc nhở nhé' : 'Your AFK status is now `True`, I\'ll warn whoever pings you')] })
        }

        const removed = await ModAfk.deleteOne(filter)
        await interaction.editReply({ embeds: [(removed.deletedCount)
            ? Embed('Green', vi ? 'Đã tắt AFK!' : 'AFK off!', vi ? 'Đã set trạng thái AFK của bạn là `False`, chào mừng trở lại!' : 'Your AFK status is now `False`, welcome back!')
            : Embed('DarkButNotBlack', vi ? 'Bỏ qua!' : 'Skipped!', vi ? 'Lạy bác, đang không AFK mà set `False` thì skip luôn, thêm gì cho mệt vậy!' : 'You weren\'t AFK, so `False` changes nothing, lol')] })
    }
}
