const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const wait = require('node:timers/promises').setTimeout

const { SeiaEmbed } = require('../../Utils/embed')
const { GetLanguage } = require('../../Utils/language')
const { OnCooldown, SetCooldown } = require('../../Utils/cooldown')
const Clock = require('../../Utils/clock')
const Log = require('../../Utils/logger')
const { Game2048, Game2048_Modes } = require('../../Functions/Fun/Game-2048/Game-2048')
const Game2048Db = require('../../Database/Fun/game-2048')
const Game2048Best = require('../../Database/Fun/game-2048-best')

const BLANK = '1097172753985056859'
const VI_NOTE = `-# <:seiaehem:1244128370669650060> Currently, Vietnamese Isn't Supported Here... Please Wait Until My Dad Update It!`

function createDefaultMenu(noSaved = true) {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('new-game').setLabel('[New Game]').setEmoji('1254109761125875802').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('load-game').setLabel('[Load Game]').setEmoji('1254109782592327783').setStyle(ButtonStyle.Secondary).setDisabled(noSaved)
        )
    ]
}

// 3x5 arrow pad, the empty spots are disabled blank buttons
function createGameButtons(UndoUsed = true) {
    const Blank = (n) => new ButtonBuilder().setCustomId(`blank${n}`).setEmoji(BLANK).setStyle(ButtonStyle.Secondary).setDisabled(true)
    const Arrow = (id, emoji) => new ButtonBuilder().setCustomId(id).setEmoji(emoji).setStyle(ButtonStyle.Primary)
    return [
        new ActionRowBuilder().addComponents(Blank(1), Blank(2), Arrow('up', '1086297338961739896'), Blank(3), Blank(4)),
        new ActionRowBuilder().addComponents(Blank(5), Arrow('left', '1086297531379613767'), Arrow('down', '1086297356011585697'), Arrow('right', '1086297678624854077'), Blank(6)),
        new ActionRowBuilder().addComponents(
            Blank(7),
            new ButtonBuilder().setCustomId('undo').setEmoji('1390076263951237240').setStyle(ButtonStyle.Secondary).setDisabled(UndoUsed),
            Blank(8),
            new ButtonBuilder().setCustomId('quit').setEmoji('❌').setStyle(ButtonStyle.Secondary),
            Blank(9)
        )
    ]
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game-2048')
        .setDescription('Play 2048 with various modes (not supported save/load game)')
        .setDescriptionLocalizations({ vi: 'Chơi 2048 với một vài chế độ (hiện không hỗ trợ save/load game)' })
        .addStringOption(option => option.setName('game-key')
            .setDescription('The game mode you wanted to play - Default: default')
            .setDescriptionLocalizations({ vi: 'Chế độ game mà bạn muốn chơi - Mặc định: default' })
            .addChoices(
                { name: '[Default]', value: 'default' },
                { name: '[Hidden]', value: 'hidden' },
                { name: '[Swap]', value: 'swap' },
                { name: '[Anomaly]', value: 'anomaly' })
            .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply()
        const cdtime = 20000

        const LangKey = await GetLanguage(interaction)
        if (!LangKey) return
        if (await OnCooldown(interaction, 'Game2048', LangKey)) return

        //Saved game = a game that isn't lost yet
        const DbFilter = { guildID: interaction.guild.id, userID: interaction.user.id }
        const GameData = await Game2048Db.findOne(DbFilter).lean()
        const Saved = (GameData?.gameStats?.lost === false) ? GameData.gameStats : null

        const MenuEmbed = SeiaEmbed(interaction, 'Grey')
            .setTitle('**2048 Game - Menu**')
            .setDescription((Saved)
                ? `Welcome back, ${interaction.user}! Would you like to Load The Current Game?\n> **Mode:** \`${Saved.mode}\`\n▸ **Score:** \`${Saved.scores?.current}\` ▸ **Moves:** \`${Saved.moveCount}\`\n> Saved Date: <t:${Math.floor(Saved.timestamp / 1000)}> | <t:${Math.floor(Saved.timestamp / 1000)}:R>`
                : `Welcome ${interaction.user} to 2048 game, please select button below to Start The Game!`)

        const Menu = await interaction.editReply({ embeds: [MenuEmbed], components: createDefaultMenu(!Saved) })
        const choice = await Menu.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 30000 }).catch(() => null)
        if (!choice) return interaction.editReply({ components: [] })

        //New game (mode from the option) or the saved one
        const Load = (choice.customId === 'load-game' && Saved)
        const gameKey = (Load) ? Saved.mode : (interaction.options.getString('game-key') || 'default')
        const Game = new Game2048(gameKey)
        if (Load) Game.Load(Saved)
        else Game.CreateGame()
        const Modeinfo = Game.settings

        await choice.update({
            embeds: [SeiaEmbed(interaction)
                .setTitle(`**Game 2048** (Mode: \`${Modeinfo.name}\`)`)
                .setDescription(`Please use the **Arrow Buttons** to **Move**, <:undo:1390076263951237240> to **Undo**, and **❌** to quit\n${Modeinfo.desc}\n\n${VI_NOTE}`)],
            components: []
        })
        await wait(5000)

        const BoardEmbed = (color = 'Yellow', desc = `Use arrows to move, <:undo:1390076263951237240> to Undo, ❌ to Quit.\n${VI_NOTE}`) => SeiaEmbed(interaction, color)
            .setTitle(`**Game 2048** (Mode: \`${Modeinfo.name}\`)`)
            .setDescription(desc)
            .addFields({
                name: `► **Score:** \`${Game.score}\` ► **Moves:** \`${Game.moveCount}\``,
                value: Game.ToString()
            })
        const SaveGame = () => Game2048Db.updateOne(DbFilter, { $set: { gameStats: Game.Save() } }, { upsert: true })
            .catch(err => Log.Error('Game 2048 - cannot save:', err.message))

        const InputMessage = await interaction.editReply({ embeds: [BoardEmbed()], components: createGameButtons(true) })
        const collector = InputMessage.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 180000
        })

        //Clicks are handled one by one, so fast clicking can't mix up the board
        let queue = Promise.resolve()
        collector.on('collect', (i) => {
            queue = queue.then(async () => {
                if (collector.ended) return i.deferUpdate().catch(() => {})
                if (i.customId === 'quit') {
                    await i.deferUpdate().catch(() => {})
                    return collector.stop('quit')
                }

                const moved = (i.customId === 'undo') ? Game.Undo() : Game.Move(i.customId)
                if (!moved) return i.deferUpdate().catch(() => {})

                collector.resetTimer()
                await i.update({ embeds: [BoardEmbed()], components: createGameButtons(Game.undoUsed) })
                await SaveGame()
                if (Game.lost) collector.stop('lose')
            }).catch(err => Log.Error('Game 2048:', err))
        })

        // Best game of this mode (for /game-2048-top). Returns true on a new best score
        const SaveBest = async () => {
            if (Game.score <= 0) return false
            const filter = { guildID: interaction.guild.id, userID: interaction.user.id, mode: Game.mode }
            const best = await Game2048Best.findOne(filter).lean()
            if (best && best.score >= Game.score) return false
            await Game2048Best.updateOne(filter, { $set: { score: Game.score, tile: Game.MaxTile(), moves: Game.moveCount, date: Clock.Now() } }, { upsert: true })
            return true
        }

        collector.on('end', async (_, reason) => {
            await queue
            await SetCooldown(interaction.user.id, 'Game2048', Clock.Now() + cdtime).catch(() => {})
            await SaveGame()
            const NewBest = await SaveBest().catch(err => { Log.Error('Game 2048 - cannot save best:', err.message); return false })

            let reasonText
            switch (reason) {
                case 'quit': {
                    if (Modeinfo.hidden) Game.showOnce = true
                    reasonText = 'Game Saved! Here is the saved board before you left.\n> You manually quit the game.'
                    break
                }
                case 'lose': {
                    reasonText = 'Game Over! Here is your result of the game\n> No more valid moves!'
                    break
                }
                default: {
                    if (Modeinfo.hidden) Game.showOnce = true
                    reasonText = 'Game Saved! Here is the saved board before you left.\n> You took too long to respond.'
                }
            }

            if (NewBest) reasonText += '\n> 🏆 **New best score!** See the leaderboard with `/game-2048-top`'

            //The interaction token only lasts 15 minutes, long games edit the message directly
            const GameOver = { embeds: [BoardEmbed('Grey', `${reasonText}\n\n${VI_NOTE}`)], components: [] }
            await interaction.editReply(GameOver).catch(() => InputMessage.edit(GameOver)).catch(() => {})
        })
    }
}
